import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { deleteNote } from '../../services/idb'

export const useDeleteNoteMutation = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
): UseMutationResult<void, Error, string> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: (...args) => {
      queryClient.refetchQueries({ queryKey: ['notes'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
