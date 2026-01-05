import { useMemo } from 'react'
import { FolderQueryResult } from './queries/useFolderQuery'
import { useSettingsStore } from './stores/useSettingsStore'
import { Folder, Note } from '@renderer/services/idb'

type TreeEntry = { type: 'folder'; folder: Folder } | { type: 'note'; note: Note }

export const useSortedFolderEntries = (data?: FolderQueryResult) => {
  const folderSortMode = useSettingsStore((s) => s.folderSortMode)
  return useMemo(() => {
    const subfolders = data?.subfolders || []
    const notes = data?.notes || []
    const entries: TreeEntry[] = [
      ...subfolders.map((folder) => ({ type: 'folder' as const, folder })),
      ...notes.map((note) => ({ type: 'note' as const, note }))
    ]

    const labelFor = (entry: TreeEntry) =>
      entry.type === 'folder' ? entry.folder.name : entry.note.title || 'New Note'
    const updatedFor = (entry: TreeEntry) =>
      entry.type === 'folder' ? entry.folder.updatedAt : entry.note.updatedAt

    return entries.sort((a, b) => {
      if (folderSortMode === 'updated') {
        const delta = updatedFor(b) - updatedFor(a)
        if (delta !== 0) return delta
      }
      const labelDelta = labelFor(a).localeCompare(labelFor(b))
      if (labelDelta !== 0) return labelDelta
      // Prefer folders before notes when labels match.
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return 0
    })
  }, [folderSortMode, data])
}
