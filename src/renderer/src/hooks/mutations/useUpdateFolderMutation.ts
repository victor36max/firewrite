import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { updateFolder, UpdateFolderPayload } from '@renderer/services/idb'

export const useUpdateFolderMutation = (
  options?: Omit<UseMutationOptions<void, Error, UpdateFolderPayload>, 'mutationFn'>
): UseMutationResult<void, Error, UpdateFolderPayload> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateFolder,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['folders'] })
      await queryClient.invalidateQueries({ queryKey: ['folder'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
