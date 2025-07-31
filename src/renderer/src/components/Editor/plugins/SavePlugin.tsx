import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useUpdateNoteMutation } from '@renderer/hooks/mutations/useUpdateNoteMutation'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { EditorState } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'

export const SavePlugin = (): null => {
  const [editor] = useLexicalComposerContext()
  const { currentNoteId } = useCurrentNoteIdStore()
  const { mutate: updateNote } = useUpdateNoteMutation()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [shouldSave, setShouldSave] = useState(false)

  useEffect(() => {
    if (shouldSave) {
      return
    }

    setTimeout(() => {
      setShouldSave(true)
    }, 1000)
  }, [shouldSave])

  const debouncedSave = useCallback(
    (editorState: EditorState) => {
      if (!currentNoteId) {
        return
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (!shouldSave) {
          // Do not save for the first 1000ms
          return
        }

        updateNote({ id: currentNoteId, content: JSON.stringify(editorState) })
        debounceTimeoutRef.current = null
      }, 1000)
    },
    [currentNoteId, shouldSave, updateNote]
  )

  useEffect(() => {
    if (!currentNoteId) {
      return
    }

    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      debouncedSave(editorState)
    })
    return removeUpdateListener
  }, [editor, currentNoteId, debouncedSave])

  return null
}
