import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { deleteNote } from '../../services/idb'
import { trackEvent } from '@renderer/services/tracking'

export const useDeleteNoteMutation = (
  options?: Omit<UseMutationOptions<string, Error, string>, 'mutationFn'>
) => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: async (...args) => {
      trackEvent('note-deleted')
      await queryClient.refetchQueries({ queryKey: ['notes'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
