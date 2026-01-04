import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuFolderPlus, LuX } from 'react-icons/lu'
import { Input } from './primitives/Input'
import { Button } from './primitives/Button'
import { useState } from 'react'
import { useCreateFolderMutation } from '@renderer/hooks/mutations/useCreateFolderMutation'

interface CreateFolderDialogProps {
  parentId: string | null
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  onCreated?: (folderId: string) => void
}

export const CreateFolderDialog = ({
  parentId,
  isOpen,
  onOpenChange,
  onCreated
}: CreateFolderDialogProps) => {
  const [name, setName] = useState('')

  const { mutate: createFolder, isPending } = useCreateFolderMutation({
    onSuccess: (id) => {
      setName('')
      onOpenChange?.(false)
      onCreated?.(id)
    }
  })

  return (
    <DialogTrigger onOpenChange={onOpenChange} isOpen={isOpen}>
      {/* Add this hidden button just to hide warnings */}
      <IconButton Icon={LuFolderPlus} className="hidden" />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                New Folder
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
                    createFolder({ name: trimmed, parentId })
                  }}
                  isDisabled={isPending || !name.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
