import { Dialog, DialogTrigger, Form, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuFolder, LuMoveRight, LuX } from 'react-icons/lu'
import { useEffect, useMemo, useState } from 'react'
import { Button } from './primitives/Button'
import { Select } from './primitives/Select'
import { useFoldersQuery } from '@renderer/hooks/queries/useFoldersQuery'
import { useUpdateNoteMutation } from '@renderer/hooks/mutations/useUpdateNoteMutation'
import { useFolderTreeStateStore } from '@renderer/hooks/stores/useFolderTreeStateStore'

interface MoveNoteDialogProps {
  noteId: string
  currentFolderId: string | null
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const MoveNoteDialog = ({
  noteId,
  currentFolderId,
  isOpen,
  onOpenChange
}: MoveNoteDialogProps) => {
  const { data: folders } = useFoldersQuery()
  const ensureExpanded = useFolderTreeStateStore((s) => s.ensureExpanded)
  const ROOT_KEY = '__root__'
  const defaultFolderId = useMemo(() => currentFolderId ?? ROOT_KEY, [currentFolderId])
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId)
  const { mutate: updateNote, isPending } = useUpdateNoteMutation()

  useEffect(() => {
    if (isOpen) setSelectedFolderId(defaultFolderId)
  }, [defaultFolderId, isOpen])

  const folderItems = useMemo(() => {
    return [
      {
        label: '.',
        value: ROOT_KEY,
        icon: <LuFolder className="w-4 h-4 text-muted-foreground" />
      },
      ...(folders || []).map((f) => ({
        label: f.name,
        value: f.id,
        icon: <LuFolder className="w-4 h-4 text-muted-foreground" />
      }))
    ]
  }, [ROOT_KEY, folders])

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const destFolderId = selectedFolderId === ROOT_KEY ? null : selectedFolderId

    if (destFolderId === currentFolderId) {
      onOpenChange?.(false)
      return
    }

    updateNote(
      { id: noteId, folderId: destFolderId },
      {
        onSuccess: () => {
          if (destFolderId) {
            ensureExpanded([destFolderId])
          }
          onOpenChange?.(false)
        }
      }
    )
  }

  return (
    <DialogTrigger onOpenChange={onOpenChange} isOpen={isOpen}>
      {/* Add this hidden button just to hide warnings */}
      <IconButton Icon={LuMoveRight} className="hidden" />
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Move note
              </Heading>
              <IconButton slot="close" Icon={LuX} excludeFromTabOrder />
            </div>
            <Form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <Select
                aria-label="Destination folder"
                placeholder="Select folder"
                selectedKey={selectedFolderId}
                onSelectionChange={(key) => setSelectedFolderId(key as string)}
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
                    (selectedFolderId === ROOT_KEY ? null : selectedFolderId) === currentFolderId
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
