import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getAllNotesSortedByUpdated, Note } from '../../services/idb'

export type UseNotesQueryOptions<T = Note[]> = Omit<
  UseQueryOptions<Note[], Error>,
  'queryKey' | 'queryFn' | 'select'
> & {
  select?: (notes: Note[]) => T
}

export const useNotesQuery = <T = Note[]>(options?: UseNotesQueryOptions<T>) => {
  return useQuery({
    queryKey: ['notes'],
    queryFn: getAllNotesSortedByUpdated,
    ...options
  })
}
