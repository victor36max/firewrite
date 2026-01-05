import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { createNote, CreateNotePayload } from '../../services/idb'
import { trackEvent } from '@renderer/services/tracking'
import { fireAndForget } from '@renderer/utils'

export const useCreateNoteMutation = (
  options?: Omit<UseMutationOptions<string, Error, CreateNotePayload>, 'mutationFn'>
): UseMutationResult<string, Error, CreateNotePayload> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: async (...args) => {
      trackEvent('note-created')
      fireAndForget([
        queryClient.invalidateQueries({ queryKey: ['notes'] }),
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
        queryClient.invalidateQueries({ queryKey: ['folder'] }),
        queryClient.invalidateQueries({ queryKey: ['note-count'] }),
        queryClient.invalidateQueries({ queryKey: ['folder-delete-stats'] })
      ])
      onSuccess?.(...args)
    },
    ...rest
  })
}
