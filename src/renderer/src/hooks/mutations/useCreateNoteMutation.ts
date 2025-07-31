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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      options?.onSuccess?.(...args)
    },
    ...options
  })
}
