import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getNote, Note } from '../../services/idb'

export type UseNoteQueryOptions<T = Note> = Omit<
  UseQueryOptions<Note, Error>,
  'queryKey' | 'queryFn' | 'select'
> & {
  select?: (note: Note) => T
}

export const useNoteQuery = <T>(noteId: string, options?: UseNoteQueryOptions<T>) => {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId),
    ...options
  })
}
