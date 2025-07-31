import { useCreateNoteMutation } from '@renderer/hooks/mutations/useCreateNoteMutation'
import { useNotesQuery } from '@renderer/hooks/queries/useNotesQuery'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { cn } from '@renderer/utils'
import { useEffect } from 'react'

export const NotesMenu = (): React.JSX.Element => {
  const { data: notes } = useNotesQuery()
  const { mutate: createNote } = useCreateNoteMutation({
    onSuccess: (id) => {
      setCurrentNoteId(id)
    }
  })
  const { currentNoteId, setCurrentNoteId } = useCurrentNoteIdStore()

  useEffect(() => {
    if (notes && notes.length === 0) {
      createNote({ title: '', content: '' })
    }
  }, [notes, createNote])

  return (
    <div className="py-4">
      <div className="py-2 px-4 flex flex-row justify-end items-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => createNote({ title: '', content: '' })}
        >
          New
        </button>
      </div>
      {notes?.map((note) => (
        <button
          className={cn('w-full py-2 px-4 text-left', currentNoteId === note.id && 'bg-gray-200')}
          key={note.id}
          onClick={() => setCurrentNoteId(note.id)}
        >
          {note.title || 'New Note'}
        </button>
      ))}
    </div>
  )
}
