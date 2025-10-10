import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useDebouncedCallback } from 'use-debounce'
import { useUpdateCurrentNote } from '@renderer/hooks/useUpdateCurrentNote'
import { EditorState } from 'lexical'
import { removeAutocompleteNodes } from '@renderer/utils'
import { useSavingStateStore } from '@renderer/hooks/stores/useSavingStateStore'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useHotkeys } from 'react-hotkeys-hook'
import { useToast } from '@renderer/hooks/useToast'
import { useCallback } from 'react'

export const SavePlugin = () => {
  const { showToast } = useToast()
  const [editor] = useLexicalComposerContext()
  const savingState = useSavingStateStore((state) => state.savingState)
  const setSavingState = useSavingStateStore((state) => state.setSavingState)
  const updateNote = useUpdateCurrentNote()

  const save = useCallback(
    async (editorState: EditorState) => {
      setSavingState('saving')
      try {
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 500)),
          updateNote({ content: JSON.stringify(removeAutocompleteNodes(editorState.toJSON())) })
        ])
        setSavingState('saved')
      } catch (error) {
        console.error(error)
        setSavingState('pending')
      }
    },
    [updateNote, setSavingState]
  )

  const autoSave = useDebouncedCallback(async (editorState: EditorState) => {
    save(editorState)
  }, 500)

  useHotkeys(
    ['ctrl+s', 'meta+s'],
    async () => {
      if (savingState === 'saved') {
        showToast({
          title: 'Already saved',
          description: 'Your changes have already been saved.',
          variant: 'info'
        })
        return
      }

      await save(editor.getEditorState())

      showToast({
        title: 'Saved',
        description: 'Your changes have been saved.',
        variant: 'success'
      })
    },
    {
      enableOnContentEditable: true
    },
    [savingState]
  )

  return (
    <OnChangePlugin
      onChange={(editorState, _editor, tags) => {
        if (tags.has('autocomplete-suggest') || tags.has('autocomplete-cancel')) {
          return
        }

        setSavingState('pending')
        autoSave(editorState)
      }}
    />
  )
}
