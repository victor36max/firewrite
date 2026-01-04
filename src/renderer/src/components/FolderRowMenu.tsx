import { useState } from 'react'
import { Menu, MenuTrigger, Popover } from 'react-aria-components'
import { LuEllipsis } from 'react-icons/lu'
import { IconButton } from './primitives/IconButton'
import { MoreMenuItem } from './MoreMenu'
import { RenameFolderDialog } from './RenameFolderDialog'
import { DeleteFolderDialog } from './DeleteFolderDialog'
import { MoveFolderDialog } from './MoveFolderDialog'
import { useCurrentFolderIdStore } from '@renderer/hooks/stores/useCurrentFolderIdStore'
import { useFolderTreeStateStore } from '@renderer/hooks/stores/useFolderTreeStateStore'

export const FolderRowMenu = ({
  folderId,
  folderName,
  currentParentId
}: {
  folderId: string
  folderName: string
  currentParentId: string | null
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const { currentFolderId, setCurrentFolderId } = useCurrentFolderIdStore()
  const { expandedFolderIds, setExpandedFolderIds } = useFolderTreeStateStore()

  return (
    <>
      <MenuTrigger>
        <IconButton
          aria-label="Folder menu"
          Icon={LuEllipsis}
          size="sm"
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-transparent hover:bg-muted"
          onMouseDown={(e) => {
            // Avoid selecting the folder row / starting a drag when opening the menu.
            e.preventDefault()
            e.stopPropagation()
          }}
        />
        <Popover placement="bottom right">
          <Menu className="outline-none rounded-lg border border-muted min-w-32">
            <MoreMenuItem onAction={() => setIsRenameOpen(true)}>Rename</MoreMenuItem>
            <MoreMenuItem onAction={() => setIsMoveOpen(true)}>Move to folder</MoreMenuItem>
            <MoreMenuItem className="text-destructive" onAction={() => setIsDeleteOpen(true)}>
              Delete
            </MoreMenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>

      <RenameFolderDialog
        folderId={folderId}
        initialName={folderName}
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />
      <MoveFolderDialog
        folderId={folderId}
        currentParentId={currentParentId}
        isOpen={isMoveOpen}
        onOpenChange={setIsMoveOpen}
      />
      <DeleteFolderDialog
        folderId={folderId}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={(deletedId) => {
          if (currentFolderId === deletedId) setCurrentFolderId(null)
          setExpandedFolderIds(expandedFolderIds.filter((id) => id !== deletedId))
        }}
      />
    </>
  )
}
