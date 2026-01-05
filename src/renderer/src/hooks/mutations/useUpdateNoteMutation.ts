import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query'
import { updateNote, UpdateNotePayload } from '../../services/idb'
import { fireAndForget } from '@renderer/utils'

type UseUpdateNoteMutationOptions = Omit<
  UseMutationOptions<void, Error, UpdateNotePayload>,
  'mutationFn'
>

export const useUpdateNoteMutation = ({
  onSuccess,
  ...rest
}: UseUpdateNoteMutationOptions = {}): UseMutationResult<void, Error, UpdateNotePayload> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNote,
    onSuccess: (...args) => {
      const payload = args[1]
      fireAndForget([
        queryClient.invalidateQueries({ queryKey: ['notes'] }),
        queryClient.invalidateQueries({ queryKey: ['folders'] }),
        queryClient.invalidateQueries({ queryKey: ['folder'] })
      ])
      if (payload.title !== undefined) {
        fireAndForget(queryClient.refetchQueries({ queryKey: ['note', payload.id] }))
      }

      if (payload.content !== undefined) {
        fireAndForget(queryClient.refetchQueries({ queryKey: ['note-content', payload.id] }))
      }

      if (payload.folderId !== undefined) {
        fireAndForget(queryClient.refetchQueries({ queryKey: ['note', payload.id] }))
      }
      onSuccess?.(...args)
    },
    ...rest
  })
}
