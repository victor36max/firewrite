import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getNotesByFolderSortedByUpdated, Note } from '../../services/idb'

export type UseNotesQueryOptions<T = Note[]> = Omit<
  UseQueryOptions<Note[], Error>,
  'queryKey' | 'queryFn' | 'select'
> & {
  select?: (notes: Note[]) => T
}

export const useNotesQuery = <T = Note[]>(
  folderId?: string | null,
  options?: UseNotesQueryOptions<T>
) => {
  return useQuery({
    queryKey: ['notes', folderId ?? null],
    queryFn: async () => {
      // Indexed query works for root as well (folderId null) due to folderKey normalization.
      return await getNotesByFolderSortedByUpdated(folderId ?? null)
    },
    ...options
  })
}
