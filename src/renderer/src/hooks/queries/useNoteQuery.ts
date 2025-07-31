import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { getNote, Note } from '../../services/idb'

export const useNoteQuery = (
  noteId: string,
  options?: Omit<UseQueryOptions<Note, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<Note, Error> => {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId),
    ...options
  })
}
