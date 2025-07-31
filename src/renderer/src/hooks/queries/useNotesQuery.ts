import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { getAllNotesSortedByUpdated, Note } from '../../services/idb'

export const useNotesQuery = (
  options?: Omit<UseQueryOptions<Note[], Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<Note[], Error> => {
  return useQuery({
    queryKey: ['notes'],
    queryFn: getAllNotesSortedByUpdated,
    ...options
  })
}
