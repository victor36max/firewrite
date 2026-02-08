import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Editor } from './Editor'
import { TitleInput } from './TitleInput'
import { MoreMenu } from './MoreMenu'
import { SavingStateIndicator } from './SavingStateIndicator'
import { cn } from '@renderer/utils'

const Container = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('px-6', className)} {...props}>
      <div className="max-w-screen-sm mx-auto">{children}</div>
    </div>
  )
}

export const NoteEditor = (): React.JSX.Element | null => {
  const currentNoteId = useCurrentNoteIdStore((store) => store.currentNoteId)
  return (
    <div className="min-h-full" contentEditable suppressContentEditableWarning>
      <Container
        contentEditable={false}
        className="pt-10 pb-2 -mb-2 bg-background/70 backdrop-blur-sm sticky top-0 z-10"
      >
        <div contentEditable={false} className="flex flex-row items-start gap-4">
          <TitleInput key={'title-' + currentNoteId} />
          <div className="flex flex-row items-center gap-4">
            <SavingStateIndicator />
            <MoreMenu />
          </div>
        </div>
      </Container>
      <Container contentEditable={false} className="pb-10">
        <Editor key={'editor-' + currentNoteId} />
      </Container>
    </div>
  )
}
