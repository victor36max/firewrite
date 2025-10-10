import { useSavingStateStore } from '@renderer/hooks/stores/useSavingStateStore'
import { LuCheck } from 'react-icons/lu'
import { LoadingText } from './primitives/LoadingText'

export const SavingStateIndicator = () => {
  const savingState = useSavingStateStore((state) => state.savingState)
  if (savingState === 'saved') {
    return (
      <span className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
        <LuCheck className="text-success" />
        Saved
      </span>
    )
  }

  if (savingState === 'saving') {
    return <LoadingText className="text-xs" text="Saving" />
  }

  return <span className="text-xs text-muted-foreground">Edited</span>
}
