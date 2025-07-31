import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { getNoteContent, NoteContent } from '../../services/idb'

export const useNoteContentQuery = (
  noteId: string,
  options?: Omit<UseQueryOptions<NoteContent, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<NoteContent, Error> => {
  return useQuery({
    queryKey: ['note-content', noteId],
    queryFn: () => getNoteContent(noteId),
    ...options
  })
}
