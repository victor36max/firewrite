import { keyValueStore } from '@renderer/services/idb'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useCurrentFolderIdStore = create<{
  // null = root (no folder)
  currentFolderId: string | null
  setCurrentFolderId: (id: string | null) => void
}>()(
  persist(
    (set) => ({
      currentFolderId: null,
      setCurrentFolderId: (id) => set({ currentFolderId: id })
    }),
    {
      name: 'current-folder-id',
      storage: createJSONStorage(() => keyValueStore)
    }
  )
)
