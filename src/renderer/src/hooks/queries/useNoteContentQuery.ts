import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getNoteContent, NoteContent } from '../../services/idb'

export type UseNoteContentQueryOptions<T = NoteContent> = Omit<
  UseQueryOptions<NoteContent, Error>,
  'queryKey' | 'queryFn' | 'select'
> & {
  select?: (content: NoteContent) => T
}

export const useNoteContentQuery = <T = NoteContent>(
  noteId: string,
  options?: UseNoteContentQueryOptions<T>
) => {
  return useQuery({
    queryKey: ['note-content', noteId],
    queryFn: () => getNoteContent(noteId),
    ...options
  })
}
