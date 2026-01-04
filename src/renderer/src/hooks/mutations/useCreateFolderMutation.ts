import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { createFolder, CreateFolderPayload } from '@renderer/services/idb'

export const useCreateFolderMutation = (
  options?: Omit<UseMutationOptions<string, Error, CreateFolderPayload>, 'mutationFn'>
): UseMutationResult<string, Error, CreateFolderPayload> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFolder,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['folders'] })
      await queryClient.invalidateQueries({ queryKey: ['folder'] })
      await queryClient.invalidateQueries({ queryKey: ['folder-delete-stats'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
