import { create } from 'zustand'

type SavingState = 'pending' | 'saving' | 'saved'

export const useSavingStateStore = create<{
  savingState: SavingState
  setSavingState: (savingState: SavingState) => void
}>()((set) => ({
  savingState: 'saved',
  setSavingState: (savingState) => set({ savingState })
}))
