import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { deleteNote } from '../../services/idb'
import { trackEvent } from '@renderer/services/tracking'
import { fireAndForget } from '@renderer/utils'

export const useDeleteNoteMutation = (
  options?: Omit<UseMutationOptions<string, Error, string>, 'mutationFn'>
) => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: async (...args) => {
      trackEvent('note-deleted')
      fireAndForget([
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
