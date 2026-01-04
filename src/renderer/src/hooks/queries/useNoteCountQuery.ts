import { useQuery } from '@tanstack/react-query'
import { getNoteCount } from '@renderer/services/idb'

export const useNoteCountQuery = () => {
  return useQuery({
    queryKey: ['note-count'],
    queryFn: getNoteCount
  })
}
