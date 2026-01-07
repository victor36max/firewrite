import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { cn } from '@renderer/utils'
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableNode
} from '@lexical/table'
import { $getNodeByKey } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Menu, MenuItem } from 'react-aria-components'
import { createPortal } from 'react-dom'
import { OPEN_TABLE_ACTION_MENU_COMMAND } from '@renderer/components/Editor/plugins/table-commands'

type ActionMenuItemProps = {
  id: string
  children: React.ReactNode
  onAction: () => void
  hasTopBorder?: boolean
  tone?: 'default' | 'destructive'
}

const ActionMenuItem = ({
  id,
  children,
  onAction,
  hasTopBorder = false,
  tone = 'default'
}: ActionMenuItemProps) => {
  return (
    <MenuItem
      id={id}
      className={({ isFocused, isHovered }) =>
        cn(
          'p-2 px-3 text-left block w-full cursor-pointer outline-none text-sm',
          hasTopBorder && 'border-t border-muted',
          tone === 'destructive' && 'text-destructive',
          (isFocused || isHovered) && 'bg-muted-light'
        )
      }
      onAction={onAction}
    >
      {children}
    </MenuItem>
  )
}

interface TableActionMenuPluginProps {
  anchorElement: HTMLDivElement | null
}

export const TableActionMenuPlugin = ({
  anchorElement
}: TableActionMenuPluginProps): React.JSX.Element | null => {
  const [editor] = useLexicalComposerContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [activeCellKey, setActiveCellKey] = useState<string | null>(null)

  const removeTable = useCallback(() => {
    if (!activeCellKey) return
    editor.update(() => {
      const node = $getNodeByKey(activeCellKey)
      if (!node || !$isTableCellNode(node)) return

      let parent = node.getParent()
      while (parent && !$isTableNode(parent)) {
        parent = parent.getParent()
      }
      if (!parent) return

      // Remove the entire table and keep the editor in a sane state.
      const next = parent.getNextSibling()
      parent.remove()

      // Prefer selecting the next block if it exists.
      if (next && 'selectStart' in next && typeof next.selectStart === 'function') {
        next.selectStart()
      }
    })
    setIsOpen(false)
  }, [activeCellKey, editor])

  const runTableAction = useCallback(
    (action: 'addRowBelow' | 'removeRow' | 'addColRight' | 'removeCol') => {
      if (!activeCellKey) return
      editor.update(() => {
        const node = $getNodeByKey(activeCellKey)
        if (!node || !$isTableCellNode(node)) return

        // Ensure table utils operate on the intended cell.
        node.selectStart()

        switch (action) {
          case 'addRowBelow':
            $insertTableRowAtSelection(true)
            break
          case 'removeRow':
            $deleteTableRowAtSelection()
            break
          case 'addColRight':
            $insertTableColumnAtSelection(true)
            break
          case 'removeCol':
            $deleteTableColumnAtSelection()
            break
        }
      })
      setIsOpen(false)
    },
    [activeCellKey, editor]
  )

  const openForCellKey = useCallback(
    (cellKey: string) => {
      if (!anchorElement) return
      const openFromElement = (cellElement: HTMLElement) => {
        if (!menuRef.current) return
        const rect = cellElement.getBoundingClientRect()
        const anchorRect = anchorElement.getBoundingClientRect()
        const menuWidth = menuRef.current.clientWidth
        const menuHeight = menuRef.current.clientHeight

        const clamp = (value: number, min: number, max: number) =>
          Math.min(Math.max(value, min), max)

        const top = rect.bottom - anchorRect.top + 8
        const left = rect.right - anchorRect.left - menuWidth

        setActiveCellKey(cellKey)
        setPosition({
          top: clamp(top, 0, Math.max(0, anchorRect.height - menuHeight)),
          left: clamp(left, 0, Math.max(0, anchorRect.width - menuWidth))
        })
        setIsOpen(true)
      }

      const cellElement = editor.getElementByKey(cellKey) as HTMLElement | null
      if (!cellElement) {
        // In rare cases the DOM mapping may not be ready; retry next frame.
        requestAnimationFrame(() => {
          const retryEl = editor.getElementByKey(cellKey) as HTMLElement | null
          if (!retryEl) return
          openFromElement(retryEl)
        })
        return
      }

      openFromElement(cellElement)
    },
    [anchorElement, editor]
  )

  useEffect(() => {
    return editor.registerCommand(
      OPEN_TABLE_ACTION_MENU_COMMAND,
      (payload) => {
        openForCellKey(payload.cellKey)
        return true
      },
      0
    )
  }, [editor, openForCellKey])

  useEffect(() => {
    if (!isOpen) return

    const onPointerDownCapture = (event: PointerEvent) => {
      const rawTarget = event.target as Node | null
      const targetEl =
        rawTarget instanceof Element ? rawTarget : (rawTarget?.parentElement as Element | null)
      if (!targetEl) return

      if (menuRef.current && menuRef.current.contains(targetEl)) return
      setIsOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDownCapture, true)
    }
  }, [isOpen])

  if (!anchorElement) return null

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'absolute', top: position?.top, left: position?.left }}
      className={cn(!isOpen && 'invisible pointer-events-none')}
      data-active-cell-key={activeCellKey || undefined}
    >
      <Menu
        aria-label="Table actions"
        className="rounded-lg border border-muted bg-background outline-none font-sans"
        onAction={() => setIsOpen(false)}
      >
        <ActionMenuItem id="add-row-below" onAction={() => runTableAction('addRowBelow')}>
          Add row below
        </ActionMenuItem>
        <ActionMenuItem id="remove-row" hasTopBorder onAction={() => runTableAction('removeRow')}>
          Remove row
        </ActionMenuItem>
        <ActionMenuItem
          id="add-col-right"
          hasTopBorder
          onAction={() => runTableAction('addColRight')}
        >
          Add column right
        </ActionMenuItem>
        <ActionMenuItem id="remove-col" hasTopBorder onAction={() => runTableAction('removeCol')}>
          Remove column
        </ActionMenuItem>
        <ActionMenuItem id="remove-table" hasTopBorder tone="destructive" onAction={removeTable}>
          Remove table
        </ActionMenuItem>
      </Menu>
    </div>,
    anchorElement
  )
}
