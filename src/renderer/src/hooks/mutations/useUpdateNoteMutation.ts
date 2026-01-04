import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { updateNote, UpdateNotePayload } from '../../services/idb'

export const useUpdateNoteMutation = (): UseMutationResult<void, Error, UpdateNotePayload> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNote,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['folder'] })
      if (payload.title) {
        queryClient.refetchQueries({ queryKey: ['note', payload.id] })
      }

      if (payload.content) {
        queryClient.refetchQueries({ queryKey: ['note-content', payload.id] })
      }

      if (payload.folderId !== undefined) {
        queryClient.refetchQueries({ queryKey: ['note', payload.id] })
      }
    }
  })
}
