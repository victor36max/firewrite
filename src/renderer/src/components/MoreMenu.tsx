import { Menu, MenuItem, MenuItemProps, MenuTrigger, Popover } from 'react-aria-components'
import { IconButton } from './primitives/IconButton'
import { LuEllipsis } from 'react-icons/lu'
import { cn } from '@renderer/utils'
import { useState } from 'react'
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { DeleteNoteDialog } from './DeleteNoteDialog'
import { useLexicalEditorStore } from '@renderer/hooks/stores/useLexicalEditorStore'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { useToast } from '@renderer/hooks/useToast'
import { MoveNoteDialog } from './MoveNoteDialog'

export const MoreMenuItem = ({ className, children, ...props }: MenuItemProps) => {
  return (
    <MenuItem
      className={({ isHovered, isFocused }) =>
        cn(
          'p-2 px-3  bg-background cursor-pointer outline-none',
          isHovered && 'bg-muted-light',
          isFocused && 'bg-muted-light',
          className
        )
      }
      {...props}
    >
      {children}
    </MenuItem>
  )
}

export const MoreMenu = () => {
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false)
  const [isMoveNoteDialogOpen, setIsMoveNoteDialogOpen] = useState(false)
  const { currentNoteId } = useCurrentNoteIdStore()
  const { data: title = 'New Note' } = useCurrentNote({
    select: (note) => note.title
  })
  const { data: currentFolderId } = useCurrentNote({
    select: (note) => note.folderId
  })
  const { getMarkdownContent } = useLexicalEditorStore()
  const { showToast } = useToast()
  const exportMarkdown = async () => {
    const markdown = await getMarkdownContent()
    if (!markdown) {
      showToast({
        title: 'Error',
        description: 'No content to export',
        variant: 'error'
      })
      return
    }
    const markdownWithTitle = `# ${title}\n\n${markdown}`
    const filename = `${title}.md`
    const blob = new Blob([markdownWithTitle], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return (
    <>
      <MenuTrigger>
        <IconButton aria-label="Menu" Icon={LuEllipsis} excludeFromTabOrder />
        <Popover placement="bottom right">
          <Menu className="outline-none rounded-lg border border-muted min-w-24">
            <MoreMenuItem onAction={exportMarkdown}>Export Markdown</MoreMenuItem>
            <MoreMenuItem onAction={() => setIsMoveNoteDialogOpen(true)}>
              Move to folder
            </MoreMenuItem>
            <MoreMenuItem
              className="text-destructive"
              onAction={() => setIsDeleteNoteDialogOpen(true)}
            >
              Delete
            </MoreMenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>{' '}
      {currentNoteId && (
        <MoveNoteDialog
          noteId={currentNoteId}
          currentFolderId={currentFolderId ?? null}
          isOpen={isMoveNoteDialogOpen}
          onOpenChange={setIsMoveNoteDialogOpen}
        />
      )}
      {currentNoteId && (
        <DeleteNoteDialog
          noteId={currentNoteId}
          isOpen={isDeleteNoteDialogOpen}
          onOpenChange={setIsDeleteNoteDialogOpen}
        />
      )}
    </>
  )
}
