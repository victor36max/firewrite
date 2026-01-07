import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { cn } from '@renderer/utils'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { $getSelection, $isRangeSelection, getDOMSelection } from 'lexical'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { OPEN_INSERT_TABLE_MENU_COMMAND } from '@renderer/components/Editor/plugins/table-commands'
import { IconButton } from '@renderer/components/primitives/IconButton'
import { LuX } from 'react-icons/lu'

interface InsertTableMenuPluginProps {
  anchorElement: HTMLDivElement | null
  maxRows?: number
  maxColumns?: number
}

export const InsertTableMenuPlugin = ({
  anchorElement,
  maxRows = 6,
  maxColumns = 6
}: InsertTableMenuPluginProps): React.JSX.Element | null => {
  const [editor] = useLexicalComposerContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [size, setSize] = useState({ rows: 2, columns: 2 })

  const cells = useMemo(() => {
    const total = maxRows * maxColumns
    return Array.from({ length: total }, (_, idx) => {
      const r = Math.floor(idx / maxColumns) + 1
      const c = (idx % maxColumns) + 1
      return { r, c }
    })
  }, [maxColumns, maxRows])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  useHotkeys(
    'esc',
    () => {
      if (isOpen) close()
    },
    [isOpen, close]
  )

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const updatePositionFromSelection = useCallback(() => {
    if (!anchorElement) return

    editor.getEditorState().read(() => {
      if (!menuRef.current) return
      const selection = $getSelection()
      if (!selection || !$isRangeSelection(selection) || !selection.isCollapsed()) {
        setIsOpen(false)
        return
      }

      const nativeSelection = getDOMSelection(editor._window)
      if (!nativeSelection) {
        setIsOpen(false)
        return
      }

      const nativeRange = nativeSelection.rangeCount ? nativeSelection.getRangeAt(0) : null
      if (!nativeRange) {
        setIsOpen(false)
        return
      }

      const selectionRect = nativeRange.getBoundingClientRect()
      // Collapsed ranges sometimes return a 0x0 rect; prefer the first client rect when available.
      const firstClientRect = nativeRange.getClientRects()?.[0]
      const caretRect =
        firstClientRect && (firstClientRect.width !== 0 || firstClientRect.height !== 0)
          ? firstClientRect
          : selectionRect
      const anchorRect = anchorElement.getBoundingClientRect()
      const menuWidth = menuRef.current.clientWidth
      const menuHeight = menuRef.current.clientHeight

      const rawLeft = caretRect.x - anchorRect.x
      const rawTop = caretRect.y + caretRect.height - anchorRect.y + 8
      const maxLeft = Math.max(0, anchorRect.width - menuWidth)
      const maxTop = Math.max(0, anchorRect.height - menuHeight)

      setPosition({
        top: clamp(rawTop, 0, maxTop),
        left: clamp(rawLeft, 0, maxLeft)
      })
    })
  }, [anchorElement, editor])

  const insert = useCallback(
    (rows: number, columns: number) => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: String(rows),
        columns: String(columns),
        includeHeaders: { rows: true, columns: false }
      })
      close()
    },
    [close, editor]
  )

  useEffect(() => {
    if (!anchorElement) return

    return mergeRegister(
      editor.registerCommand(
        OPEN_INSERT_TABLE_MENU_COMMAND,
        () => {
          setSize({ rows: 2, columns: 2 })
          setIsOpen(true)
          updatePositionFromSelection()
          return true
        },
        0
      ),
      editor.registerUpdateListener(() => {
        if (!isOpen) return
        updatePositionFromSelection()
      })
    )
  }, [anchorElement, editor, isOpen, updatePositionFromSelection])

  useEffect(() => {
    if (!anchorElement || !isOpen) return

    const onScrollOrResize = () => updatePositionFromSelection()
    window.addEventListener('resize', onScrollOrResize)
    // Capture scroll events from any scroll container.
    window.addEventListener('scroll', onScrollOrResize, true)

    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [anchorElement, isOpen, updatePositionFromSelection])

  if (!anchorElement) return null

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'absolute', top: position?.top, left: position?.left }}
      className={cn(!isOpen && 'invisible pointer-events-none')}
    >
      <div className="rounded-lg border border-muted bg-background p-3 shadow-lg font-sans flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {size.rows} x {size.columns}
          </div>
          <IconButton type="button" Icon={LuX} onPress={close} variant="default" size="sm" />
        </div>

        <div className="rounded-md bg-muted-light p-2">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${maxColumns}, 1fr)` }}>
            {cells.map(({ r, c }) => {
              const isHighlighted = r <= size.rows && c <= size.columns
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={cn(
                    'size-6 rounded-sm border border-muted cursor-pointer',
                    isHighlighted
                      ? 'bg-primary/15 border-primary/40'
                      : 'bg-background hover:bg-background/80'
                  )}
                  onMouseEnter={() => setSize({ rows: r, columns: c })}
                  onClick={() => insert(r, c)}
                  aria-label={`Insert ${r} by ${c} table`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    anchorElement
  )
}
