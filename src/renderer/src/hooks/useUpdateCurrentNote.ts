import { UpdateNotePayload } from '@renderer/services/idb'
import { useUpdateNoteMutation } from './mutations/useUpdateNoteMutation'
import { useCurrentNoteIdStore } from './stores/useCurrentNodeIdStore'

export const useUpdateCurrentNote = () => {
  const { currentNoteId } = useCurrentNoteIdStore()
  const { mutate: updateNote } = useUpdateNoteMutation()

  return ({ content, title }: Omit<UpdateNotePayload, 'id'>) => {
    if (!currentNoteId) {
      return
    }

    updateNote({ id: currentNoteId, content, title })
  }
}
