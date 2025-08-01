import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { useUpdateCurrentNote } from '@renderer/hooks/useUpdateCurrentNote'

export const TitleInput = (): React.JSX.Element | null => {
  const note = useCurrentNote()

  const updateNote = useUpdateCurrentNote()

  if (!note) {
    return null
  }

  return (
    <input
      type="text"
      className="w-full h-10 text-2xl font-bold outline-none"
      defaultValue={note.title}
      placeholder="Title"
      onBlur={(e) => updateNote({ title: e.target.value })}
    />
  )
}
