import { useCreateNoteMutation } from '@renderer/hooks/mutations/useCreateNoteMutation'
import { useDeleteNoteMutation } from '@renderer/hooks/mutations/useDeleteNoteMutation'
import { useNotesQuery } from '@renderer/hooks/queries/useNotesQuery'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Note } from '@renderer/services/idb'
import { cn } from '@renderer/utils'
import { useCallback, useEffect, useRef } from 'react'
import { SettingsDialog } from './SettingsDialog'
import { IconButton } from './primitives/IconButton'
import { Plus } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Button } from 'react-aria-components'

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
    onSuccess: (deletedNoteId) => {
      const nextNoteId = notes?.find((note) => note.id !== deletedNoteId)?.id || null
      setCurrentNoteId(nextNoteId)
    }
  })

  useHotkeys(
    ['ctrl+backspace', 'meta+backspace'],
    () => {
      if (currentNoteId) {
        deleteNote(currentNoteId)
      }
    },
    [currentNoteId, deleteNote]
  )

  useHotkeys(
    ['ctrl+n', 'meta+n'],
    () => {
      createNote({ title: '', content: '' })
    },
    [createNote]
  )

  useEffect(() => {
    if (notes && notes.length === 0) {
      createNote({ title: '', content: '' })
    }
  }, [notes, createNote])

  const renderNoteMenuItem = useCallback(
    (note: Note, index: number): React.JSX.Element => {
      return (
        <Button
          ref={(el) => {
            if (el) {
              menuItemRefs.current[note.id] = el
            }
          }}
          type="button"
          className={cn(
            'w-full py-2 px-4 text-left cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap outline-primary',
            currentNoteId === note.id && 'bg-primary/10 font-medium'
          )}
          key={note.id}
          onClick={() => setCurrentNoteId(note.id)}
          onKeyDown={(e) => {
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
        </Button>
      )
    },
    [notes, currentNoteId, setCurrentNoteId]
  )

  return (
    <div className="py-4">
      <div className="py-2 px-2 flex flex-row justify-between items-center">
        <SettingsDialog />
        <IconButton onClick={() => createNote({ title: '', content: '' })} Icon={Plus} />
      </div>
      {notes?.map(renderNoteMenuItem)}
    </div>
  )
}
