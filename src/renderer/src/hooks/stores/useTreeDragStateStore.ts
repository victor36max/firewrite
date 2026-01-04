import { create } from 'zustand'

export const useTreeDragStateStore = create<{
  dragOverFolderId: string | null
  dragOverRoot: boolean
  setDragOverFolderId: (id: string | null) => void
  setDragOverRoot: (value: boolean) => void
  clear: () => void
}>()((set) => ({
  dragOverFolderId: null,
  dragOverRoot: false,
  setDragOverFolderId: (id) =>
    set((s) => (s.dragOverFolderId === id ? s : { ...s, dragOverFolderId: id })),
  setDragOverRoot: (value) =>
    set((s) => (s.dragOverRoot === value ? s : { ...s, dragOverRoot: value })),
  clear: () =>
    set((s) =>
      s.dragOverFolderId === null && s.dragOverRoot === false
        ? s
        : { ...s, dragOverFolderId: null, dragOverRoot: false }
    )
}))
