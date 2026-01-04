import { keyValueStore } from '@renderer/services/idb'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type FolderTreeState = {
  expandedFolderIds: string[]
  setExpandedFolderIds: (ids: string[]) => void
  toggleFolderExpanded: (id: string) => void
  ensureExpanded: (ids: string[]) => void
}

export const useFolderTreeStateStore = create<FolderTreeState>()(
  persist(
    (set, get) => ({
      expandedFolderIds: [],
      setExpandedFolderIds: (ids) => {
        set({ expandedFolderIds: Array.from(new Set(ids)) })
      },
      toggleFolderExpanded: (id) => {
        const { expandedFolderIds } = get()
        const setIds = new Set(expandedFolderIds)
        if (setIds.has(id)) setIds.delete(id)
        else setIds.add(id)
        set({ expandedFolderIds: Array.from(setIds) })
      },
      ensureExpanded: (ids) => {
        const { expandedFolderIds } = get()
        set({ expandedFolderIds: Array.from(new Set([...expandedFolderIds, ...ids])) })
      }
    }),
    {
      name: 'folder-tree-state',
      storage: createJSONStorage(() => keyValueStore)
    }
  )
)
