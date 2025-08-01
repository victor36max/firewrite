import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useCurrentNoteIdStore = create<{
  currentNoteId: string | null
  setCurrentNoteId: (id: string | null) => void
}>()(
  persist(
    (set) => ({
      currentNoteId: null,
      setCurrentNoteId: (id) => set({ currentNoteId: id })
    }),
    {
      name: 'current-note-id',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
