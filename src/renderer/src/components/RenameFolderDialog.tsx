import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuPencil, LuX } from 'react-icons/lu'
import { Input } from './primitives/Input'
import { Button } from './primitives/Button'
import { useEffect, useState } from 'react'
import { useUpdateFolderMutation } from '@renderer/hooks/mutations/useUpdateFolderMutation'

interface RenameFolderDialogProps {
  folderId: string
  initialName: string
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const RenameFolderDialog = ({
  folderId,
  initialName,
  isOpen,
  onOpenChange
}: RenameFolderDialogProps) => {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (isOpen) setName(initialName)
  }, [initialName, isOpen])

  const { mutate: updateFolder, isPending } = useUpdateFolderMutation({
    onSuccess: () => {
      onOpenChange?.(false)
    }
  })

  return (
    <DialogTrigger onOpenChange={onOpenChange} isOpen={isOpen}>
      {/* hidden trigger to satisfy react-aria */}
      <IconButton Icon={LuPencil} className="hidden" />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Rename Folder
              </Heading>
              <IconButton slot="close" Icon={LuX} excludeFromTabOrder />
            </div>
            <div className="p-4 space-y-4">
              <Input
                autoFocus
                placeholder="Folder name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const trimmed = name.trim()
                    if (!trimmed) return
                    if (trimmed === initialName) {
                      onOpenChange?.(false)
                      return
                    }
                    updateFolder({ id: folderId, name: trimmed })
                  }}
                  isDisabled={isPending || !name.trim()}
                >
                  Rename
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
