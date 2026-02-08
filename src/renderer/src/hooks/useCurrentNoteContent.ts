import { NoteContent } from '@renderer/services/idb'
import { useNoteContentQuery, UseNoteContentQueryOptions } from './queries/useNoteContentQuery'
import { useCurrentNoteIdStore } from './stores/useCurrentNodeIdStore'

export const useCurrentNoteContent = <T = NoteContent>(
  options?: Omit<UseNoteContentQueryOptions<T>, 'enabled'>
) => {
  const currentNoteId = useCurrentNoteIdStore((store) => store.currentNoteId)
  return useNoteContentQuery(currentNoteId || '', {
    enabled: !!currentNoteId,
    ...options
  })
}
