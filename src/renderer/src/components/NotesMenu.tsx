import { useCreateNoteMutation } from '@renderer/hooks/mutations/useCreateNoteMutation'
import { useDeleteNoteMutation } from '@renderer/hooks/mutations/useDeleteNoteMutation'
import { useNotesQuery } from '@renderer/hooks/queries/useNotesQuery'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Note } from '@renderer/services/idb'
import { cn } from '@renderer/utils'
import { useCallback, useEffect, useRef } from 'react'
import { SettingsDialog } from './SettingsDialog'

export const NotesMenu = (): React.JSX.Element => {
  const { data: notes } = useNotesQuery()
  const { currentNoteId, setCurrentNoteId } = useCurrentNoteIdStore()
  const menuItemRefs = useRef<Record<string, HTMLButtonElement>>({})
  const { mutate: createNote } = useCreateNoteMutation({
    onSuccess: (id) => {
      setCurrentNoteId(id)
    }
  })
  const { mutate: deleteNote } = useDeleteNoteMutation({
    onSuccess: () => {
      setCurrentNoteId(null)
    }
  })

  useEffect(() => {
    if (notes && notes.length === 0) {
      createNote({ title: '', content: '' })
    }
  }, [notes, createNote])

  const renderNoteMenuItem = useCallback(
    (note: Note, index: number): React.JSX.Element => {
      return (
        <button
          ref={(el) => {
            if (el) {
              menuItemRefs.current[note.id] = el
            }
          }}
          type="button"
          className={cn(
            'w-full py-2 px-4 text-left cursor-pointer',
            currentNoteId === note.id && 'bg-gray-200'
          )}
          key={note.id}
          onClick={() => setCurrentNoteId(note.id)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
              deleteNote(note.id)
            }

            if (e.key === 'ArrowUp' && notes) {
              if (index > 0) {
                const previousNoteId = notes[index - 1].id
                menuItemRefs.current[previousNoteId].focus()
              }
            }

            if (e.key === 'ArrowDown' && notes) {
              if (index < notes.length - 1) {
                const nextNoteId = notes[index + 1].id
                menuItemRefs.current[nextNoteId].focus()
              }
            }
          }}
        >
          {note.title || 'New Note'}
        </button>
      )
    },
    [notes, currentNoteId, setCurrentNoteId, deleteNote]
  )

  return (
    <div className="py-4">
      <div className="py-2 px-4 flex flex-row justify-between items-center">
        <SettingsDialog />
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => createNote({ title: '', content: '' })}
        >
          New
        </button>
      </div>
      {notes?.map(renderNoteMenuItem)}
    </div>
  )
}
