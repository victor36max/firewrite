import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { useUpdateCurrentNote } from '@renderer/hooks/useUpdateCurrentNote'

export const TitleInput = (): React.JSX.Element | null => {
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })

  const updateNote = useUpdateCurrentNote()

  if (title === undefined) {
    return null
  }

  return (
    <input
      type="text"
      className="w-full h-10 text-2xl font-bold outline-none"
      defaultValue={title}
      placeholder="Title"
      onBlur={(e) => updateNote({ title: e.target.value })}
    />
  )
}
