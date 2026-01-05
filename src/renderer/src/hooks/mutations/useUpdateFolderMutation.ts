import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { updateFolder, UpdateFolderPayload } from '@renderer/services/idb'
import { fireAndForget } from '@renderer/utils'

export const useUpdateFolderMutation = (
  options?: Omit<UseMutationOptions<void, Error, UpdateFolderPayload>, 'mutationFn'>
): UseMutationResult<void, Error, UpdateFolderPayload> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateFolder,
    onSuccess: async (...args) => {
      fireAndForget([
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
        queryClient.invalidateQueries({ queryKey: ['folder'] })
      ])
      onSuccess?.(...args)
    },
    ...rest
  })
}
