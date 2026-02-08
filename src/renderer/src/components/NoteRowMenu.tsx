import { useState } from 'react'
import { Menu, MenuTrigger, Popover } from 'react-aria-components'
import { LuEllipsis } from 'react-icons/lu'
import { IconButton } from './primitives/IconButton'
import { MoreMenuItem } from './MoreMenu'
import { RenameNoteDialog } from './RenameNoteDialog'
import { DeleteNoteDialog } from './DeleteNoteDialog'
import { MoveNoteDialog } from './MoveNoteDialog'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { useCurrentFolderIdStore } from '@renderer/hooks/stores/useCurrentFolderIdStore'

export const NoteRowMenu = ({
  noteId,
  noteTitle,
  currentFolderId
}: {
  noteId: string
  noteTitle: string
  currentFolderId: string | null
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const setCurrentNoteId = useCurrentNoteIdStore((store) => store.setCurrentNoteId)
  const setCurrentFolderId = useCurrentFolderIdStore((store) => store.setCurrentFolderId)

  const ensureSelected = () => {
    setCurrentFolderId(null)
    setCurrentNoteId(noteId)
  }

  return (
    <>
      <MenuTrigger>
        <IconButton
          aria-label="Note menu"
          Icon={LuEllipsis}
          size="sm"
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-transparent hover:bg-muted"
          onMouseDown={(e) => {
            // Avoid selecting the row / starting a drag when opening the menu.
            e.preventDefault()
            e.stopPropagation()
          }}
        />
        <Popover placement="bottom right">
          <Menu className="outline-none rounded-lg border border-muted min-w-32">
            <MoreMenuItem
              onAction={() => {
                ensureSelected()
                setIsRenameOpen(true)
              }}
            >
              Rename
            </MoreMenuItem>
            <MoreMenuItem
              onAction={() => {
                ensureSelected()
                setIsMoveOpen(true)
              }}
            >
              Move to folder
            </MoreMenuItem>
            <MoreMenuItem
              className="text-destructive"
              onAction={() => {
                ensureSelected()
                setIsDeleteOpen(true)
              }}
            >
              Delete
            </MoreMenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>

      <RenameNoteDialog
        noteId={noteId}
        initialTitle={noteTitle}
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />
      <MoveNoteDialog
        noteId={noteId}
        currentFolderId={currentFolderId}
        isOpen={isMoveOpen}
        onOpenChange={setIsMoveOpen}
      />
      <DeleteNoteDialog noteId={noteId} isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </>
  )
}
