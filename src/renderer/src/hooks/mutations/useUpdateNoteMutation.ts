import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { updateNote, UpdateNotePayload } from '../../services/idb'

export const useUpdateNoteMutation = (): UseMutationResult<void, Error, UpdateNotePayload> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNote,
    onSuccess: (_, payload) => {
      queryClient.refetchQueries({ queryKey: ['notes'] })
      if (payload.title) {
        queryClient.refetchQueries({ queryKey: ['note', payload.id] })
      }

      if (payload.content) {
        queryClient.refetchQueries({ queryKey: ['note-content', payload.id] })
      }
    }
  })
}
