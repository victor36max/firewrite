import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { updateNote, UpdateNotePayload } from '../../services/idb'

export const useUpdateNoteMutation = (): UseMutationResult<void, Error, UpdateNotePayload> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNote,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      if (payload.title) {
        queryClient.invalidateQueries({ queryKey: ['note', payload.id] })
      }

      if (payload.content) {
        queryClient.invalidateQueries({ queryKey: ['note-content', payload.id] })
      }
    }
  })
}
