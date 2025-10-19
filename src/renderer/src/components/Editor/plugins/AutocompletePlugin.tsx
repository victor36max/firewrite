import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createAutocompleteNode,
  AutocompleteNode
} from '@renderer/components/Editor/nodes/AutocompleteNode'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND,
  LexicalNode
} from 'lexical'
import { useCallback, useEffect, useRef } from 'react'
import { mergeRegister } from '@lexical/utils'
import { useMutation } from '@tanstack/react-query'
import { generateAutocompleteSuggestion } from '@renderer/services/ai'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { $isCodeNode, $isCodeHighlightNode } from '@lexical/code'
import { trackEvent } from '@renderer/services/tracking'

const AUTOCOMPLETE_DELAY = 3000

// This UUID is to make sure that we only display autocomplete suggestions for the current app lifecycle
// It doesn't load any previously persisted autocomplete suggestions
// eslint-disable-next-line react-refresh/only-export-components
export const AUTOCOMPLETE_UUID = crypto.randomUUID()

const findTopLevelSiblingNodes = (node: LexicalNode) => {
  let previous: LexicalNode | null = null
  let current: LexicalNode | null = node
  let next: LexicalNode | null = null

  while (current) {
    const parent = current.getParent()
    if ($isRootNode(parent)) {
      previous = current.getPreviousSibling()
      let prevTextContent = previous?.getTextContent() || null
      while (previous && !prevTextContent) {
        previous = previous?.getPreviousSibling()
        prevTextContent = previous?.getTextContent() || null
      }

      next = current.getNextSibling()
      let nextTextContent = next?.getTextContent() || null
      while (next && !nextTextContent) {
        next = next?.getNextSibling()
        nextTextContent = next?.getTextContent() || null
      }

      return {
        previous: prevTextContent,
        current: current.getTextContent(),
        next: nextTextContent
      }
    }

    current = parent
  }

  return { previous: null, current: null, next: null }
}

export const AutocompletePlugin = (): null => {
  const [editor] = useLexicalComposerContext()
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autocompleteNodeKeyRef = useRef<string | null>(null)
  const shouldShowAutocompleteRef = useRef(false)
  const { data: note } = useCurrentNote()
  const { mutate: genAutocomplete } = useMutation({
    mutationFn: generateAutocompleteSuggestion,
    onSuccess: (data) => {
      if (!shouldShowAutocompleteRef.current) return
      showAutocomplete(data)
    }
  })

  const showAutocomplete = useCallback(
    (text: string) => {
      if (autocompleteNodeKeyRef.current) return
      editor.update(
        () => {
          const selection = $getSelection()
          if (!selection || !$isRangeSelection(selection)) return
          const selectionNode = $getNodeByKey(selection.anchor.key)
          if (!selectionNode) return

          trackEvent('autocomplete-triggered')

          const selectionClone = selection.clone()
          const node = $createAutocompleteNode(text, AUTOCOMPLETE_UUID)
          const nodeKey = node.getKey()
          autocompleteNodeKeyRef.current = nodeKey
          selection.insertNodes([node])
          $setSelection(selectionClone)
        },
        {
          tag: 'autocomplete-suggest'
        }
      )
    },
    [editor]
  )

  const removeAutocomplete = useCallback(() => {
    if (!autocompleteNodeKeyRef.current) return
    shouldShowAutocompleteRef.current = false
    editor.update(
      () => {
        const node = $getNodeByKey(autocompleteNodeKeyRef.current!)
        if (!node) return
        node.remove()
        autocompleteNodeKeyRef.current = null
      },
      {
        tag: 'autocomplete-cancel'
      }
    )
  }, [editor])

  const commitAutocomplete = useCallback(() => {
    shouldShowAutocompleteRef.current = false
    editor.update(
      () => {
        if (!autocompleteNodeKeyRef.current) return
        const selection = $getSelection()
        const node = $getNodeByKey(autocompleteNodeKeyRef.current)
        if (!node) return
        if (!(node instanceof AutocompleteNode)) return
        trackEvent('autocomplete-accepted')
        node.remove()
        autocompleteNodeKeyRef.current = null
        if (selection) {
          selection.insertText(node.__text)
        }
      },
      {
        tag: 'autocomplete-commit'
      }
    )
  }, [editor])

  const getTextAndGenerateAutocomplete = useCallback(() => {
    shouldShowAutocompleteRef.current = true
    editor.read(() => {
      const selection = $getSelection()
      if (!selection || !$isRangeSelection(selection)) return
      const selectionNode = $getNodeByKey(selection.anchor.key)
      if (!selectionNode) return

      if ($isCodeNode(selectionNode) || $isCodeHighlightNode(selectionNode)) {
        return
      }

      let selectionTextContent = ''
      // If the selection is not at the end of the text node, don't gen autocomplete
      if (selectionNode.getType() === 'text') {
        selectionTextContent = selectionNode.getTextContent()

        if (selection.anchor.offset !== selectionTextContent.length) {
          return
        }
      }

      const { previous, current, next } = findTopLevelSiblingNodes(selectionNode)

      if (!previous && !current && !next) return

      genAutocomplete({
        title: note?.title || '',
        previous,
        current,
        next
      })
    })
  }, [editor, genAutocomplete, note?.title])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ tags }) => {
        // Skip updates caused by autocomplete suggestions or cancellations
        if (tags.has('autocomplete-suggest') || tags.has('autocomplete-cancel')) {
          return
        }

        removeAutocomplete()

        if (autocompleteTimeoutRef.current) {
          clearTimeout(autocompleteTimeoutRef.current)
        }
        autocompleteTimeoutRef.current = setTimeout(() => {
          getTextAndGenerateAutocomplete()
        }, AUTOCOMPLETE_DELAY)
      }),

      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event: KeyboardEvent) => {
          if (!autocompleteNodeKeyRef.current) {
            if (autocompleteTimeoutRef.current) {
              clearTimeout(autocompleteTimeoutRef.current)
            }

            getTextAndGenerateAutocomplete()
            return false
          }

          event.preventDefault()
          commitAutocomplete()
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        (event: KeyboardEvent) => {
          if (!autocompleteNodeKeyRef.current) {
            if (autocompleteTimeoutRef.current) {
              clearTimeout(autocompleteTimeoutRef.current)
            }

            getTextAndGenerateAutocomplete()
            return false
          }

          event.preventDefault()
          commitAutocomplete()
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [
    commitAutocomplete,
    editor,
    getTextAndGenerateAutocomplete,
    removeAutocomplete,
    showAutocomplete
  ])

  return null
}
