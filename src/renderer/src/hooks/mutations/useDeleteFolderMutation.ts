import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { deleteFolder } from '@renderer/services/idb'

export const useDeleteFolderMutation = (
  options?: Omit<UseMutationOptions<string, Error, string>, 'mutationFn'>
) => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['folders'] })
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      await queryClient.invalidateQueries({ queryKey: ['folder'] })
      await queryClient.invalidateQueries({ queryKey: ['note-count'] })
      await queryClient.invalidateQueries({ queryKey: ['folder-delete-stats'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
