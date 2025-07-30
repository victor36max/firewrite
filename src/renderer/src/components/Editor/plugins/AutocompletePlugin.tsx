import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createAutocompleteNode } from '@renderer/components/Editor/nodes/AutocompleteNode'
import {
  $getNodeByKey,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND,
  LexicalNode
} from 'lexical'
import { useCallback, useEffect, useRef } from 'react'
import { mergeRegister } from '@lexical/utils'
import { useMutation } from '@tanstack/react-query'
import { generateAutocompleteSuggestion } from '@renderer/services/ai'

const AUTOCOMPLETE_DELAY = 3000

const findParentParagraphNodes = (
  node: LexicalNode
): { previous: string | null; current: string | null; next: string | null } => {
  let previous: LexicalNode | null = null
  let current: LexicalNode | null = node
  let next: LexicalNode | null = null

  while (current) {
    if ($isParagraphNode(current)) {
      previous = current.getPreviousSibling()
      next = current.getNextSibling()
      return {
        previous: previous?.getTextContent() || null,
        current: current.getTextContent(),
        next: next?.getTextContent() || null
      }
    }

    current = current.getParent()
  }

  return { previous: null, current: null, next: null }
}

export const AutocompletePlugin = (): null => {
  const [editor] = useLexicalComposerContext()
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autocompleteNodeKeyRef = useRef<string | null>(null)
  const { mutate: genAutocomplete } = useMutation({
    mutationFn: generateAutocompleteSuggestion,
    onSuccess: (data) => {
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

          const selectionClone = selection.clone()
          const node = $createAutocompleteNode(text, 'autocomplete')
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
    editor.update(
      () => {
        if (!autocompleteNodeKeyRef.current) return
        const selection = $getSelection()
        const node = $getNodeByKey(autocompleteNodeKeyRef.current)
        if (!node) return
        const text = node.getTextContent()
        if (selection && text) {
          selection.insertText(text)
        }
      },
      {
        tag: 'autocomplete-commit'
      }
    )
  }, [editor])

  const getTextAndGenerateAutocomplete = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection()
      if (!selection || !$isRangeSelection(selection)) return
      const selectionNode = $getNodeByKey(selection.anchor.key)
      if (!selectionNode) return

      let selectionTextContent = ''
      // If the selection is not at the end of the text node, don't gen autocomplete
      if (selectionNode.getType() === 'text') {
        selectionTextContent = selectionNode.getTextContent()

        if (selection.anchor.offset !== selectionTextContent.length) {
          return
        }
      }

      const { previous, current, next } = findParentParagraphNodes(selectionNode)

      if (!previous && !current && !next) return

      genAutocomplete({
        previous,
        current,
        next
      })
    })
  }, [editor, genAutocomplete])

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
          event.preventDefault()
          if (!autocompleteNodeKeyRef.current) {
            if (autocompleteTimeoutRef.current) {
              clearTimeout(autocompleteTimeoutRef.current)
            }

            getTextAndGenerateAutocomplete()
            return false
          }

          commitAutocomplete()
          return true
        },
        COMMAND_PRIORITY_EDITOR
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
        COMMAND_PRIORITY_EDITOR
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
