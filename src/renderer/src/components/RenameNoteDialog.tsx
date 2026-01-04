import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuPencil, LuX } from 'react-icons/lu'
import { Input } from './primitives/Input'
import { Button } from './primitives/Button'
import { useEffect, useState } from 'react'
import { useUpdateNoteMutation } from '@renderer/hooks/mutations/useUpdateNoteMutation'

interface RenameNoteDialogProps {
  noteId: string
  initialTitle: string
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export const RenameNoteDialog = ({
  noteId,
  initialTitle,
  isOpen,
  onOpenChange
}: RenameNoteDialogProps) => {
  const [title, setTitle] = useState(initialTitle)

  useEffect(() => {
    if (isOpen) setTitle(initialTitle)
  }, [initialTitle, isOpen])

  const { mutate: updateNote, isPending } = useUpdateNoteMutation()

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
                Rename Note
              </Heading>
              <IconButton slot="close" Icon={LuX} excludeFromTabOrder />
            </div>
            <div className="p-4 space-y-4">
              <Input
                autoFocus
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const nextTitle = title.trim()
                    if (nextTitle === initialTitle) {
                      onOpenChange?.(false)
                      return
                    }
                    updateNote(
                      { id: noteId, title: nextTitle },
                      {
                        onSuccess: () => {
                          onOpenChange?.(false)
                        }
                      }
                    )
                  }}
                  isDisabled={isPending}
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


