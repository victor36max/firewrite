import { useCurrentNoteIdStore } from './stores/useCurrentNodeIdStore'
import { useNoteQuery, UseNoteQueryOptions } from './queries/useNoteQuery'
import { Note } from '@renderer/services/idb'

export const useCurrentNote = <T = Note>(options?: Omit<UseNoteQueryOptions<T>, 'enabled'>) => {
  const { currentNoteId } = useCurrentNoteIdStore()
  return useNoteQuery(currentNoteId || '', {
    enabled: !!currentNoteId,
    ...options
  })
}
