import { UpdateNotePayload } from '@renderer/services/idb'
import { useUpdateNoteMutation } from './mutations/useUpdateNoteMutation'
import { useCurrentNoteIdStore } from './stores/useCurrentNodeIdStore'
import { useCallback } from 'react'

export const useUpdateCurrentNote = () => {
  const currentNoteId = useCurrentNoteIdStore((store) => store.currentNoteId)
  const { mutateAsync: updateNote } = useUpdateNoteMutation()

  return useCallback(
    ({ content, title }: Omit<UpdateNotePayload, 'id'>) => {
      if (!currentNoteId) {
        return
      }

      updateNote({ id: currentNoteId, content, title })
    },
    [currentNoteId, updateNote]
  )
}
