import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Editor } from './Editor'
import { TitleInput } from './TitleInput'
import { MoreMenu } from './MoreMenu'

export const NoteEditor = (): React.JSX.Element | null => {
  const { currentNoteId } = useCurrentNoteIdStore()
  return (
    <div className="flex-1 py-10 px-6 min-h-full flex">
      <div className="max-w-screen-sm flex flex-col flex-1 mx-auto">
        <div className="flex flex-col flex-1">
          <div className="flex flex-row justify-between items-center gap-4">
            <TitleInput key={'title-' + currentNoteId} />
            <MoreMenu />
          </div>
          <Editor key={'editor-' + currentNoteId} />
        </div>
      </div>
    </div>
  )
}
