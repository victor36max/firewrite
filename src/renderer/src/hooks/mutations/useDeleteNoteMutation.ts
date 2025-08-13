import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { deleteNote } from '../../services/idb'

export const useDeleteNoteMutation = (
  options?: Omit<UseMutationOptions<string, Error, string>, 'mutationFn'>
) => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: ['notes'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
