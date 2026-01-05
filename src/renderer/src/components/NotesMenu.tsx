import { useCreateNoteMutation } from '@renderer/hooks/mutations/useCreateNoteMutation'
import { useFolderQuery } from '@renderer/hooks/queries/useFolderQuery'
import { useNoteCountQuery } from '@renderer/hooks/queries/useNoteCountQuery'
import { useCurrentFolderIdStore } from '@renderer/hooks/stores/useCurrentFolderIdStore'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { cn } from '@renderer/utils'
import { useEffect, useState } from 'react'
import { SettingsDialog } from './settings/SettingsDialog'
import { IconButton } from './primitives/IconButton'
import { LuFolderPlus, LuPlus } from 'react-icons/lu'
import { useHotkeys } from 'react-hotkeys-hook'
import { DeleteNoteDialog } from './DeleteNoteDialog'
import { CreateFolderDialog } from './CreateFolderDialog'
import { DeleteFolderDialog } from './DeleteFolderDialog'
import { FolderTreeNode } from './FolderTreeNode'
import { useUpdateNoteMutation } from '@renderer/hooks/mutations/useUpdateNoteMutation'
import { useUpdateFolderMutation } from '@renderer/hooks/mutations/useUpdateFolderMutation'
import { useFolderTreeStateStore } from '@renderer/hooks/stores/useFolderTreeStateStore'
import { NoteTreeRow } from './NoteTreeRow'
import { useTreeDragStateStore } from '@renderer/hooks/stores/useTreeDragStateStore'
import { GridList } from 'react-aria-components'
import { useSortedFolderEntries } from '@renderer/hooks/useSortedFolderEntries'

export const NotesMenu = (): React.JSX.Element => {
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false)
  const { currentFolderId, setCurrentFolderId } = useCurrentFolderIdStore()
  const { currentNoteId, setCurrentNoteId } = useCurrentNoteIdStore()
  const { expandedFolderIds, ensureExpanded, setExpandedFolderIds } = useFolderTreeStateStore()
  const {
    dragOverFolderId,
    dragOverRoot,
    setDragOverRoot,
    clear: clearAllDragState
  } = useTreeDragStateStore()
  const { data: noteCount } = useNoteCountQuery()
  const { data: rootData } = useFolderQuery(null)
  const { mutate: createNote } = useCreateNoteMutation({
    onSuccess: (id) => {
      setCurrentNoteId(id)
    }
  })
  const { mutate: updateNote } = useUpdateNoteMutation()
  const { mutate: updateFolder } = useUpdateFolderMutation()

  useHotkeys(
    ['ctrl+backspace', 'meta+backspace'],
    () => {
      if (currentFolderId) {
        setIsDeleteFolderDialogOpen(true)
        return
      }
      if (currentNoteId) setIsDeleteNoteDialogOpen(true)
    },
    [currentFolderId, currentNoteId, setIsDeleteFolderDialogOpen, setIsDeleteNoteDialogOpen]
  )

  useHotkeys(
    ['ctrl+n', 'meta+n'],
    () => {
      createNote({ title: '', content: '', folderId: currentFolderId })
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['input', 'textarea']
    },
    [createNote, currentFolderId]
  )

  useHotkeys(
    ['ctrl+shift+n', 'meta+shift+n'],
    () => {
      setIsCreateFolderDialogOpen(true)
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['input', 'textarea']
    },
    [createNote, currentFolderId]
  )

  useEffect(() => {
    // Ensure the app always has at least one note on first run.
    if (noteCount === 0) {
      createNote({ title: '', content: '', folderId: null })
    }
  }, [createNote, noteCount])

  useEffect(() => {
    // If the drag is cancelled (Esc) or dropped outside the sidebar, dragleave/drop may not fire here.
    // Clear highlight state globally.
    const clear = () => clearAllDragState()
    window.addEventListener('dragend', clear, true)
    window.addEventListener('drop', clear, true)
    return () => {
      window.removeEventListener('dragend', clear, true)
      window.removeEventListener('drop', clear, true)
    }
  }, [clearAllDragState])

  const entries = useSortedFolderEntries(rootData)

  return (
    <div className="h-full flex flex-col">
      <div className="pt-5 pb-2 px-2 flex flex-row justify-between items-center sticky top-0 bg-background">
        <SettingsDialog />
        <div className="flex flex-row gap-2">
          <IconButton onClick={() => setIsCreateFolderDialogOpen(true)} Icon={LuFolderPlus} />
          <IconButton
            onClick={() => createNote({ title: '', content: '', folderId: currentFolderId })}
            Icon={LuPlus}
          />
        </div>
      </div>

      <div className="px-2 py-2 flex-1">
        <div
          className={cn(
            'outline-none flex flex-col min-h-full rounded-md',
            dragOverRoot && !dragOverFolderId && 'ring-2 ring-primary/40'
          )}
          onClick={(e) => {
            // Clicking the empty root area should deselect the currently selected folder.
            // (Do not clear the current note selection; editor should stay on the note.)
            if (e.target !== e.currentTarget) return
            setCurrentFolderId(null)
          }}
          onDragEnterCapture={(e) => {
            e.preventDefault()
            setDragOverRoot(true)
          }}
          onDragOverCapture={(e) => {
            // Allow dropping anywhere inside the tree (including over note rows).
            // Folder rows will still handle their own drops and stop propagation.
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setDragOverRoot(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            // Only clear when leaving the element entirely
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            setDragOverRoot(false)
          }}
          onDragOver={(e) => {
            // Allow dropping on empty tree area to move to top-level (root).
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          onDrop={(e) => {
            e.preventDefault()
            clearAllDragState()
            try {
              const parsed = JSON.parse(e.dataTransfer.getData('text/plain') || '{}') as {
                type?: 'note' | 'folder'
                id?: string
              }
              if (!parsed.id) return
              if (parsed.type === 'note') {
                updateNote({ id: parsed.id, folderId: null })
                setCurrentNoteId(parsed.id)
              } else if (parsed.type === 'folder') {
                updateFolder({ id: parsed.id, parentId: null })
              }
            } catch {
              // ignore
            }
          }}
        >
          <GridList
            aria-label="Folders and notes"
            selectionMode="none"
            className="outline-none flex flex-col"
          >
            {/* Root folder is an internal container; don't render it as a visible folder. */}
            {entries.map((entry) => {
              if (entry.type === 'note')
                return (
                  <NoteTreeRow
                    key={`${entry.note.id}:${entry.note.folderId ?? 'root'}`}
                    note={entry.note}
                    depth={0}
                    isRoot
                  />
                )
              return (
                <FolderTreeNode
                  key={`${entry.folder.id}:${entry.folder.parentId ?? 'root'}`}
                  folder={entry.folder}
                  depth={0}
                />
              )
            })}
          </GridList>
          {/* Spacer to make the "drop to root" zone fill the sidebar even when the tree is short. */}
          <div
            className="flex-1"
            aria-hidden
            onClick={() => {
              setCurrentFolderId(null)
            }}
          />
        </div>
      </div>
      {currentNoteId && (
        <DeleteNoteDialog
          noteId={currentNoteId}
          isOpen={isDeleteNoteDialogOpen}
          onOpenChange={setIsDeleteNoteDialogOpen}
        />
      )}

      <CreateFolderDialog
        parentId={currentFolderId}
        isOpen={isCreateFolderDialogOpen}
        onOpenChange={setIsCreateFolderDialogOpen}
        onCreated={(id) => {
          // Ensure the parent folder is expanded so the new folder is visible.
          ensureExpanded([currentFolderId, id].filter((x): x is string => !!x))
          setCurrentFolderId(id)
        }}
      />

      {currentFolderId && (
        <DeleteFolderDialog
          folderId={currentFolderId}
          isOpen={isDeleteFolderDialogOpen}
          onOpenChange={setIsDeleteFolderDialogOpen}
          onDeleted={(deletedFolderId) => {
            // If current folder (or an ancestor) was deleted, go back to root.
            setCurrentFolderId(null)

            // Best-effort: remove the deleted folder from expansion.
            setExpandedFolderIds(expandedFolderIds.filter((id) => id !== deletedFolderId))
          }}
        />
      )}
    </div>
  )
}
