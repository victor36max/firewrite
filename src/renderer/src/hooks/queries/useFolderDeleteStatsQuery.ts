import { useQuery } from '@tanstack/react-query'
import { getFolderDeleteStats } from '@renderer/services/idb'

export const useFolderDeleteStatsQuery = (folderId: string, enabled = true) => {
  return useQuery({
    queryKey: ['folder-delete-stats', folderId],
    queryFn: () => getFolderDeleteStats(folderId),
    enabled
  })
}
