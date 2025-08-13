import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { createNote, CreateNotePayload } from '../../services/idb'

export const useCreateNoteMutation = (
  options?: Omit<UseMutationOptions<string, Error, CreateNotePayload>, 'mutationFn'>
): UseMutationResult<string, Error, CreateNotePayload> => {
  const { onSuccess, ...rest } = options || {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: async (...args) => {
      await queryClient.refetchQueries({ queryKey: ['notes'] })
      onSuccess?.(...args)
    },
    ...rest
  })
}
