import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuTrash, LuX } from 'react-icons/lu'
import { Button } from './primitives/Button'
import { useDeleteFolderMutation } from '@renderer/hooks/mutations/useDeleteFolderMutation'
import { useFolderDeleteStatsQuery } from '@renderer/hooks/queries/useFolderDeleteStatsQuery'

interface DeleteFolderDialogProps {
  folderId: string
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  onDeleted?: (folderId: string) => void
}

export const DeleteFolderDialog = ({
  folderId,
  isOpen,
  onOpenChange,
  onDeleted
}: DeleteFolderDialogProps) => {
  const { data: stats } = useFolderDeleteStatsQuery(folderId, !!isOpen)
  const folderName = stats?.folderName || 'Folder'
  const noteCount = stats?.noteCount || 0
  const folderCount = stats?.folderCount || 0

  const { mutate: deleteFolder, isPending } = useDeleteFolderMutation({
    onSuccess: (deletedId) => {
      onOpenChange?.(false)
      onDeleted?.(deletedId)
    }
  })

  const isEmpty = noteCount === 0 && folderCount === 0

  return (
    <DialogTrigger onOpenChange={onOpenChange} isOpen={isOpen}>
      {/* hidden trigger to satisfy react-aria */}
      <IconButton Icon={LuTrash} className="hidden" />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Delete Folder
              </Heading>
              <IconButton slot="close" Icon={LuX} excludeFromTabOrder />
            </div>
            <div className="p-4 space-y-4">
              {isEmpty ? (
                <div>Are you sure you want to delete “{folderName}”?</div>
              ) : (
                <div className="space-y-2">
                  <div>Deleting “{folderName}” will permanently delete everything inside it.</div>
                  <div className="text-sm text-muted-foreground">
                    This includes {noteCount} note{noteCount === 1 ? '' : 's'}
                    {folderCount > 0
                      ? ` and ${folderCount} subfolder${folderCount === 1 ? '' : 's'}`
                      : ''}
                    .
                  </div>
                </div>
              )}
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  isDisabled={isPending}
                  onClick={() => deleteFolder(folderId)}
                  autoFocus
                >
                  Delete
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
