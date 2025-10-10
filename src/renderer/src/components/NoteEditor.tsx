import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Editor } from './Editor'
import { TitleInput } from './TitleInput'
import { MoreMenu } from './MoreMenu'
import { SavingStateIndicator } from './SavingStateIndicator'
import { cn } from '@renderer/utils'

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('px-6', className)}>
      <div className="max-w-screen-sm mx-auto">{children}</div>
    </div>
  )
}

export const NoteEditor = (): React.JSX.Element | null => {
  const { currentNoteId } = useCurrentNoteIdStore()
  return (
    <div className="min-h-full">
      <Container className="pt-10 pb-2 -mb-2 bg-background/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-row justify-between items-center gap-4">
          <TitleInput key={'title-' + currentNoteId} />
          <SavingStateIndicator />
          <MoreMenu />
        </div>
      </Container>
      <Container className="pb-10">
        <Editor key={'editor-' + currentNoteId} />
      </Container>
    </div>
  )
}
