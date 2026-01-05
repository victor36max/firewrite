import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { deleteFolder } from '@renderer/services/idb'
import { fireAndForget } from '@renderer/utils'

export const useDeleteFolderMutation = (
  options?: Omit<UseMutationOptions<string, Error, string>, 'mutationFn'>
) => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: async (...args) => {
      fireAndForget([
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
        queryClient.invalidateQueries({ queryKey: ['notes'] }),
        queryClient.invalidateQueries({ queryKey: ['folder'] }),
        queryClient.invalidateQueries({ queryKey: ['note-count'] }),
        queryClient.invalidateQueries({ queryKey: ['folder-delete-stats'] })
      ])
      onSuccess?.(...args)
    },
    ...rest
  })
}
