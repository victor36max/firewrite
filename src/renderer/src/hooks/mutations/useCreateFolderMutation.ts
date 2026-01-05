import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { createFolder, CreateFolderPayload } from '@renderer/services/idb'
import { fireAndForget } from '@renderer/utils'

export const useCreateFolderMutation = (
  options?: Omit<UseMutationOptions<string, Error, CreateFolderPayload>, 'mutationFn'>
): UseMutationResult<string, Error, CreateFolderPayload> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFolder,
    onSuccess: async (...args) => {
      fireAndForget([
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
        queryClient.invalidateQueries({ queryKey: ['folder'] }),
        queryClient.invalidateQueries({ queryKey: ['folder-delete-stats'] })
      ])
      onSuccess?.(...args)
    },
    ...rest
  })
}
