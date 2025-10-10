import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { useUpdateCurrentNote } from '@renderer/hooks/useUpdateCurrentNote'
import { Input } from 'react-aria-components'

export const TitleInput = (): React.JSX.Element | null => {
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })

  const updateNote = useUpdateCurrentNote()

  if (title === undefined) {
    return null
  }

  return (
    <Input
      type="text"
      className="w-full h-10 text-2xl font-serif font-semibold outline-none placeholder:text-muted-foreground"
      defaultValue={title}
      autoFocus={!title}
      placeholder="Title"
      onBlur={(e) => updateNote({ title: e.target.value })}
    />
  )
}
