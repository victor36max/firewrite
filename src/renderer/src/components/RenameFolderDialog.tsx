import { Dialog, DialogTrigger, Form, Heading, Modal, ModalOverlay } from 'react-aria-components'
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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const nextName = (formData.get('name') as string).trim()
    if (!nextName) return
    if (nextName === initialName) {
      onOpenChange?.(false)
      return
    }
    updateFolder({ id: folderId, name: nextName })
  }

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
            <Form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <Input
                name="name"
                autoFocus
                placeholder="Folder name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="secondary" type="button" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={isPending || !name.trim() || name.trim() === initialName}
                >
                  Rename
                </Button>
              </div>
            </Form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
