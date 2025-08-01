import { Note } from '@renderer/services/idb'
import { useCurrentNoteIdStore } from './stores/useCurrentNodeIdStore'
import { useNoteQuery } from './queries/useNoteQuery'

export const useCurrentNote = (): Note | undefined => {
  const { currentNoteId } = useCurrentNoteIdStore()
  const { data: note } = useNoteQuery(currentNoteId || '', {
    enabled: !!currentNoteId
  })

  return note
}
