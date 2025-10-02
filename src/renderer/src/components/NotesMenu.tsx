import { useCreateNoteMutation } from '@renderer/hooks/mutations/useCreateNoteMutation'
import { useNotesQuery } from '@renderer/hooks/queries/useNotesQuery'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { Note } from '@renderer/services/idb'
import { cn } from '@renderer/utils'
import { useCallback, useEffect, useState } from 'react'
import { SettingsDialog } from './settings/SettingsDialog'
import { IconButton } from './primitives/IconButton'
import { LuPlus } from 'react-icons/lu'
import { useHotkeys } from 'react-hotkeys-hook'
import { Menu, MenuItem } from 'react-aria-components'
import { DeleteNoteDialog } from './DeleteNoteDialog'

export const NotesMenu = (): React.JSX.Element => {
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false)
  const { data: notes } = useNotesQuery()
  const { currentNoteId, setCurrentNoteId } = useCurrentNoteIdStore()
  const { mutate: createNote } = useCreateNoteMutation({
    onSuccess: (id) => {
      setCurrentNoteId(id)
    }
  })

  useHotkeys(
    ['ctrl+backspace', 'meta+backspace'],
    () => {
      if (currentNoteId) {
        setIsDeleteNoteDialogOpen(true)
      }
    },
    [currentNoteId, setIsDeleteNoteDialogOpen]
  )

  useHotkeys(
    ['ctrl+n', 'meta+n'],
    () => {
      createNote({ title: '', content: '' })
    },
    [createNote]
  )

  useEffect(() => {
    if (notes && notes.length === 0) {
      createNote({ title: '', content: '' })
    }
  }, [notes, createNote])

  const renderNoteMenuItem = useCallback((note: Note): React.JSX.Element => {
    const noteTitle = note.title || 'New Note'
    return (
      <MenuItem
        aria-label={noteTitle}
        id={note.id}
        key={note.id}
        className={({ isSelected, isFocused, isHovered }) =>
          cn(
            'w-full py-2 px-4 text-left cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap outline-none',

            isHovered && 'bg-muted-light',
            isFocused && 'bg-muted-light',
            isSelected && 'bg-primary/10 font-medium'
          )
        }
      >
        {noteTitle}
      </MenuItem>
    )
  }, [])

  return (
    <div className="py-4">
      <div className="py-2 px-2 flex flex-row justify-between items-center">
        <SettingsDialog />
        <IconButton onClick={() => createNote({ title: '', content: '' })} Icon={LuPlus} />
      </div>
      <Menu
        className="outline-none"
        aria-label="Notes"
        selectionMode="single"
        selectedKeys={currentNoteId ? new Set([currentNoteId]) : new Set()}
        onSelectionChange={(keys) => {
          if (keys === 'all') return
          const key = keys.values().next().value
          setCurrentNoteId(key as string)
        }}
      >
        {notes?.map(renderNoteMenuItem)}
      </Menu>
      {currentNoteId && (
        <DeleteNoteDialog
          noteId={currentNoteId}
          isOpen={isDeleteNoteDialogOpen}
          onOpenChange={setIsDeleteNoteDialogOpen}
        />
      )}
    </div>
  )
}
