import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Folder, getAllFoldersSorted } from '@renderer/services/idb'

export type UseFoldersQueryOptions<T = Folder[]> = Omit<
  UseQueryOptions<Folder[], Error>,
  'queryKey' | 'queryFn' | 'select'
> & {
  select?: (folders: Folder[]) => T
}

export const useFoldersQuery = <T = Folder[]>(options?: UseFoldersQueryOptions<T>) => {
  return useQuery({
    queryKey: ['folders'],
    queryFn: getAllFoldersSorted,
    ...options
  })
}
