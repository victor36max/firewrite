import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createAutocompleteNode } from '@renderer/nodes/AutocompleteNode'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND
} from 'lexical'
import { useCallback, useEffect, useRef } from 'react'
import { mergeRegister } from '@lexical/utils'

const AUTOCOMPLETE_DELAY = 3000

export const AutocompletePlugin = (): null => {
  const [editor] = useLexicalComposerContext()
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autocompleteTextRef = useRef('Hello')
  const autocompleteNodeKeyRef = useRef<string | null>(null)

  const showAutocomplete = useCallback(
    (onShow?: () => void) => {
      if (autocompleteNodeKeyRef.current) return
      editor.update(
        () => {
          const selection = $getSelection()
          if (!selection || !$isRangeSelection(selection)) return
          const selectionNode = $getNodeByKey(selection.anchor.key)
          if (!selectionNode) return

          // If the selection is not at the end of the text node, don't show the autocomplete
          if (selectionNode.getType() === 'text') {
            const textContent = selectionNode.getTextContent()

            if (selection.anchor.offset !== textContent.length) {
              return
            }
          }

          onShow?.()

          const selectionClone = selection.clone()
          const node = $createAutocompleteNode(autocompleteTextRef.current, 'autocomplete')
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
        const selection = $getSelection()
        if (selection && autocompleteTextRef.current) {
          selection.insertText(autocompleteTextRef.current)
        }
      },
      {
        tag: 'autocomplete-commit'
      }
    )
  }, [editor])

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
          showAutocomplete()
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

            showAutocomplete()
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

            showAutocomplete(() => {
              event.preventDefault()
            })
            return false
          }

          event.preventDefault()
          commitAutocomplete()
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [commitAutocomplete, editor, removeAutocomplete, showAutocomplete])

  return null
}
