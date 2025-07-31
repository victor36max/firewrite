import { useUpdateNoteMutation } from '@renderer/hooks/mutations/useUpdateNoteMutation'
import { useNoteQuery } from '@renderer/hooks/queries/useNoteQuery'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'

export const TitleInput = (): React.JSX.Element | null => {
  const { currentNoteId } = useCurrentNoteIdStore()
  const { data: note } = useNoteQuery(currentNoteId || '', {
    enabled: !!currentNoteId
  })

  const { mutate: updateNote } = useUpdateNoteMutation()

  if (!currentNoteId || !note) {
    return null
  }

  return (
    <input
      type="text"
      className="w-full h-10 text-2xl font-bold"
      defaultValue={note.title}
      placeholder="Title"
      onBlur={(e) => updateNote({ id: currentNoteId, title: e.target.value })}
    />
  )
}
