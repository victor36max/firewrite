import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Folder, getFolder, Note } from '@renderer/services/idb'

export type FolderQueryResult = { folder: Folder | null; subfolders: Folder[]; notes: Note[] }

export type UseFolderQueryOptions<T = FolderQueryResult> = Omit<
  UseQueryOptions<FolderQueryResult, Error>,
  'queryKey' | 'queryFn' | 'select'
> & {
  select?: (data: FolderQueryResult) => T
}

export const useFolderQuery = <T = FolderQueryResult>(
  folderId: string | null,
  options?: UseFolderQueryOptions<T>
) => {
  return useQuery({
    queryKey: ['folder', folderId ?? null],
    queryFn: () => getFolder(folderId ?? null),
    ...options
  })
}
