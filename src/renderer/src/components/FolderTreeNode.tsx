import { Folder, Note } from '@renderer/services/idb'
import { cn } from '@renderer/utils'
import { LuChevronDown, LuChevronRight, LuFolder } from 'react-icons/lu'
import { useFolderQuery } from '@renderer/hooks/queries/useFolderQuery'
import { useFolderTreeStateStore } from '@renderer/hooks/stores/useFolderTreeStateStore'
import { useSettingsStore } from '@renderer/hooks/stores/useSettingsStore'
import { useTreeDragStateStore } from '@renderer/hooks/stores/useTreeDragStateStore'
import { useCurrentFolderIdStore } from '@renderer/hooks/stores/useCurrentFolderIdStore'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { useUpdateNoteMutation } from '@renderer/hooks/mutations/useUpdateNoteMutation'
import { useUpdateFolderMutation } from '@renderer/hooks/mutations/useUpdateFolderMutation'
import { NoteTreeRow } from './NoteTreeRow'
import { FolderRowMenu } from './FolderRowMenu'
import { GridListItem } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'

type TreeEntry = { type: 'folder'; folder: Folder } | { type: 'note'; note: Note }

export const FolderTreeNode = ({ folder, depth }: { folder: Folder; depth: number }) => {
  const listKey = `${folder.id}:${folder.parentId ?? 'root'}`
  const folderSortMode = useSettingsStore((s) => s.folderSortMode)
  const { expandedFolderIds, toggleFolderExpanded, ensureExpanded } = useFolderTreeStateStore()
  const expandedFolderIdSet = new Set(expandedFolderIds)
  const isExpanded = expandedFolderIdSet.has(folder.id)

  const { currentFolderId, setCurrentFolderId } = useCurrentFolderIdStore()
  const { setCurrentNoteId } = useCurrentNoteIdStore()
  const { mutate: updateNote } = useUpdateNoteMutation()
  const { mutate: updateFolder } = useUpdateFolderMutation()

  const {
    dragOverFolderId,
    setDragOverFolderId,
    clear: clearAllDragState
  } = useTreeDragStateStore()
  const clearDragOverFolder = () => setDragOverFolderId(null)
  const handleDragOverFolder = (id: string) => setDragOverFolderId(id)

  // Cycle prevention would require a folder graph query; keep permissive for now.
  const isFolderDescendantOf = (_folderId: string, _potentialAncestorId: string) => {
    void _folderId
    void _potentialAncestorId
    return false
  }

  const getSortedEntries = (subfolders: Folder[], notes: Note[]): TreeEntry[] => {
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
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return 0
    })
  }

  // Lazy-load: only fetch folder contents if expanded.
  const { data } = useFolderQuery(folder.id, { enabled: isExpanded })

  const subfolders = data?.subfolders || []
  const notes = data?.notes || []

  const entries = isExpanded ? getSortedEntries(subfolders, notes) : []

  return (
    <>
      <GridListItem
        style={{ paddingLeft: 8 + depth * 24 }}
        textValue={folder.name}
        className={({ isFocused, isHovered }) =>
          cn(
            'group w-full py-1.5 pr-2 cursor-pointer outline-none rounded-md',
            isHovered && 'bg-muted-light',
            isFocused && 'bg-muted-light',
            currentFolderId === folder.id && 'bg-primary/10 font-medium hover:bg-primary/10',
            currentFolderId !== folder.id && 'hover:bg-muted-light',
            dragOverFolderId === folder.id && 'ring-2 ring-primary/40'
          )
        }
        id={`folder:${listKey}`}
        aria-label={folder.name}
        onAction={() => setCurrentFolderId(folder.id)}
      >
        <div
          className="flex flex-row items-center gap-2 w-full min-w-0"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'folder', id: folder.id }))
          }}
          onDragEnd={clearAllDragState}
          onDragEnterCapture={(e) => {
            e.preventDefault()
            handleDragOverFolder(folder.id)
          }}
          onDragOverCapture={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            clearDragOverFolder()
          }}
          onDropCapture={(e) => {
            e.preventDefault()
            e.stopPropagation()
            clearAllDragState()

            try {
              const parsed = JSON.parse(e.dataTransfer.getData('text/plain') || '{}') as {
                type?: 'note' | 'folder'
                id?: string
              }
              if (!parsed.id) return

              if (parsed.type === 'note') {
                updateNote({ id: parsed.id, folderId: folder.id })
                setCurrentNoteId(parsed.id)
                ensureExpanded([folder.id])
                return
              }

              if (parsed.type === 'folder') {
                if (parsed.id === folder.id) return
                if (folder.id === parsed.id) return
                if (isFolderDescendantOf(folder.id, parsed.id)) return
                updateFolder({ id: parsed.id, parentId: folder.id })
                ensureExpanded([folder.id])
              }
            } catch {
              // ignore
            }
          }}
        >
          <IconButton
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            Icon={isExpanded ? LuChevronDown : LuChevronRight}
            className="bg-transparent hover:bg-muted -mx-1"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFolderExpanded(folder.id)
            }}
          />
          <LuFolder className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
            {folder.name}
          </span>
          <FolderRowMenu
            folderId={folder.id}
            folderName={folder.name}
            currentParentId={folder.parentId}
          />
        </div>
      </GridListItem>

      {isExpanded &&
        entries.map((entry) => {
          if (entry.type === 'note') {
            return (
              <NoteTreeRow
                key={`${entry.note.id}:${entry.note.folderId ?? 'root'}`}
                note={entry.note}
                depth={depth}
              />
            )
          }
          return (
            <FolderTreeNode
              key={`${entry.folder.id}:${entry.folder.parentId ?? 'root'}`}
              folder={entry.folder}
              depth={depth + 1}
            />
          )
        })}
    </>
  )
}
