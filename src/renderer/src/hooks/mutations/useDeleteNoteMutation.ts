import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { deleteNote } from '../../services/idb'

export const useDeleteNoteMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}
