import { Dialog, DialogTrigger, Modal, ModalOverlay, Heading } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { useDeleteNoteMutation } from '@renderer/hooks/mutations/useDeleteNoteMutation'
import { LuX } from 'react-icons/lu'
import { useNotesQuery } from '@renderer/hooks/queries/useNotesQuery'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Button } from './primitives/Button'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { useToast } from '@renderer/hooks/useToast'

interface DeleteNoteDialogProps {
  noteId: string
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  trigger?: React.ReactNode
}

export const DeleteNoteDialog = ({ noteId, isOpen, onOpenChange }: DeleteNoteDialogProps) => {
  const { data: notes } = useNotesQuery()
  const { setCurrentNoteId } = useCurrentNoteIdStore()
  const { showToast } = useToast()
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })
  const { mutate: deleteNote } = useDeleteNoteMutation({
    onSuccess: (deletedNoteId) => {
      const nextNoteId = notes?.find((note) => note.id !== deletedNoteId)?.id || null
      setCurrentNoteId(nextNoteId)
      onOpenChange?.(false)
      showToast({
        title: 'Note deleted',
        description: `Note ${title || 'New Note'} deleted successfully`,
        variant: 'success'
      })
    }
  })
  return (
    <DialogTrigger onOpenChange={onOpenChange} isOpen={isOpen}>
      <ModalOverlay
        isDismissable
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Modal className="w-full max-w-screen-sm">
          <Dialog className="bg-background rounded-lg border border-muted outline-none">
            <div className="flex flex-row justify-between items-center p-4 border-b border-muted">
              <Heading slot="title" className="text-lg font-semibold">
                Delete Note
              </Heading>
              <IconButton slot="close" Icon={LuX} excludeFromTabOrder />
            </div>
            <div className="p-4 space-y-4">
              <div>Are you sure you want to delete {title || 'New Note'}?</div>
              <div className="flex flex-row gap-2 justify-end">
                <Button variant="secondary" onClick={() => onOpenChange?.(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => deleteNote(noteId)} autoFocus>
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
