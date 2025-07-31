import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Editor } from './Editor'
import { TitleInput } from './TitleInput'

export const NoteEditor = (): React.JSX.Element | null => {
  const { currentNoteId } = useCurrentNoteIdStore()
  if (!currentNoteId) {
    return null
  }

  return (
    <div className="flex flex-col flex-1">
      <TitleInput key={'title-' + currentNoteId} />
      <Editor key={'editor-' + currentNoteId} />
    </div>
  )
}
