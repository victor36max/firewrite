import { Dialog, DialogTrigger, Form, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuFolder, LuMoveRight, LuX } from 'react-icons/lu'
import { useEffect, useMemo, useState } from 'react'
import { Button } from './primitives/Button'
import { Select } from './primitives/Select'
import { useFoldersQuery } from '@renderer/hooks/queries/useFoldersQuery'
import { useUpdateFolderMutation } from '@renderer/hooks/mutations/useUpdateFolderMutation'
import { useFolderTreeStateStore } from '@renderer/hooks/stores/useFolderTreeStateStore'

interface MoveFolderDialogProps {
  folderId: string
  currentParentId: string | null
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const MoveFolderDialog = ({
  folderId,
  currentParentId,
  isOpen,
  onOpenChange
}: MoveFolderDialogProps) => {
  const { data: folders } = useFoldersQuery()
  const ensureExpanded = useFolderTreeStateStore((s) => s.ensureExpanded)
  const ROOT_KEY = '__root__'
  const defaultParentId = useMemo(() => currentParentId ?? ROOT_KEY, [currentParentId])
  const [selectedParentId, setSelectedParentId] = useState<string>(defaultParentId)
  const { mutate: updateFolder, isPending } = useUpdateFolderMutation()

  useEffect(() => {
    if (isOpen) setSelectedParentId(defaultParentId)
  }, [defaultParentId, isOpen])

  const folderItems = useMemo(() => {
    return [
      {
        label: '.',
        value: ROOT_KEY,
        icon: <LuFolder className="w-4 h-4 text-muted-foreground" />
      },
      ...(folders || [])
        .filter((f) => f.id !== folderId)
        .map((f) => ({
          label: f.name,
          value: f.id,
          icon: <LuFolder className="w-4 h-4 text-muted-foreground" />
        }))
    ]
  }, [ROOT_KEY, folders, folderId])

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const destParentId = selectedParentId === ROOT_KEY ? null : selectedParentId

    if (destParentId === currentParentId) {
      onOpenChange?.(false)
      return
    }

    updateFolder(
      { id: folderId, parentId: destParentId },
      {
        onSuccess: () => {
          if (destParentId) ensureExpanded([destParentId])
          onOpenChange?.(false)
        }
      }
    )
  }

  return (
    <DialogTrigger onOpenChange={onOpenChange} isOpen={isOpen}>
      {/* hidden trigger to satisfy react-aria */}
      <IconButton Icon={LuMoveRight} className="hidden" />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Move folder
              </Heading>
              <IconButton slot="close" Icon={LuX} excludeFromTabOrder />
            </div>
            <Form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <Select
                aria-label="Destination folder"
                placeholder="Select folder"
                selectedKey={selectedParentId}
                onSelectionChange={(key) => setSelectedParentId(key as string)}
                items={folderItems}
              />
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="secondary" type="button" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={
                    isPending ||
                    (selectedParentId === ROOT_KEY ? null : selectedParentId) === currentParentId
                  }
                  autoFocus
                >
                  Move
                </Button>
              </div>
            </Form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
