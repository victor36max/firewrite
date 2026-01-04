import { Note } from '@renderer/services/idb'
import { cn } from '@renderer/utils'
import { LuFileText } from 'react-icons/lu'
import { useCurrentFolderIdStore } from '@renderer/hooks/stores/useCurrentFolderIdStore'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { useTreeDragStateStore } from '@renderer/hooks/stores/useTreeDragStateStore'
import { NoteRowMenu } from './NoteRowMenu'
import { GridListItem } from 'react-aria-components'

export const NoteTreeRow = ({
  note,
  depth,
  isRoot
}: {
  note: Note
  depth: number
  isRoot?: boolean
}) => {
  const { currentFolderId, setCurrentFolderId } = useCurrentFolderIdStore()
  const { currentNoteId, setCurrentNoteId } = useCurrentNoteIdStore()
  const clearAllDragState = useTreeDragStateStore((s) => s.clear)

  const title = note.title || 'New Note'

  return (
    <GridListItem
      style={{ paddingLeft: 8 + (isRoot ? depth : depth + 1) * 24 }}
      textValue={title}
      className={({ isFocused, isHovered }) =>
        cn(
          'group w-full py-1.5 pr-2 cursor-pointer outline-none rounded-md',
          isHovered && 'bg-muted-light',
          isFocused && 'bg-muted-light',
          currentFolderId === null &&
            currentNoteId === note.id &&
            'bg-primary/10 font-medium hover:bg-primary/10',
          (currentFolderId !== null || currentNoteId !== note.id) && 'hover:bg-muted-light'
        )
      }
      id={`note:${note.id}`}
      aria-label={title}
      onAction={() => {
        setCurrentFolderId(null)
        setCurrentNoteId(note.id)
      }}
    >
      <div
        className="flex flex-row items-center gap-2 w-full min-w-0"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'note', id: note.id }))
        }}
        onDragEnd={clearAllDragState}
      >
        <LuFileText className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {title}
        </span>
        <NoteRowMenu
          noteId={note.id}
          noteTitle={note.title || ''}
          currentFolderId={note.folderId ?? null}
        />
      </div>
    </GridListItem>
  )
}
