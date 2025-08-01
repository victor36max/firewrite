import { NoteContent } from '@renderer/services/idb'
import { useNoteContentQuery } from './queries/useNoteContentQuery'
import { useCurrentNoteIdStore } from './stores/useCurrentNodeIdStore'

export const useCurrentNoteContent = (): NoteContent | undefined => {
  const { currentNoteId } = useCurrentNoteIdStore()
  const { data: noteContent } = useNoteContentQuery(currentNoteId || '', {
    enabled: !!currentNoteId
  })

  return noteContent
}
