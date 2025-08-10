import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { generateResearch } from '@renderer/services/ai'
import { useMutation } from '@tanstack/react-query'
import { $getRoot, $getSelection, $isRangeSelection, getDOMSelection } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface SelectionMenuPluginProps {
  anchorElement: HTMLDivElement | null
}

export const SelectionMenuPlugin = ({
  anchorElement
}: SelectionMenuPluginProps): React.JSX.Element | null => {
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<{
    top: number
    left: number
  } | null>(null)
  const { mutate: research } = useMutation({
    mutationFn: generateResearch
  })

  const handleResearch = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!selection || !$isRangeSelection(selection)) {
        return
      }
      const content = $getRoot().getTextContent()
      const selectionText = selection.getTextContent()

      research({
        title: title || '',
        content,
        selection: selectionText
      })
    })
  }, [editor, title, research])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.read(() => {
          const selection = $getSelection()
          if (!selection || !$isRangeSelection(selection) || !anchorElement) {
            setIsOpen(false)
            return
          }

          if (
            selection.anchor.key === selection.focus.key &&
            selection.anchor.offset === selection.focus.offset
          ) {
            setIsOpen(false)
            return
          }

          const nativeSelection = getDOMSelection(editor._window)

          if (!nativeSelection) {
            setIsOpen(false)
            return
          }

          const nativeRange = nativeSelection.getRangeAt(0)

          const selectionRect = nativeRange.getBoundingClientRect()
          const anchorRect = anchorElement.getBoundingClientRect()

          setPosition({
            top: selectionRect.y + selectionRect.height - anchorRect.y,
            left: selectionRect.x - anchorRect.x
          })

          setIsOpen(true)
        })
      })
    )
  }, [anchorElement, editor])

  if (!anchorElement || !isOpen) {
    return null
  }

  return createPortal(
    <div style={{ position: 'absolute', top: position?.top, left: position?.left }}>
      <div className="flex flex-row flex-wrap gap-2 mt-2">
        <button className="bg-blue-500 text-white rounded-md p-1 px-2" onClick={handleResearch}>
          Research
        </button>
        <button className="bg-blue-500 text-white rounded-md p-1 px-2" onClick={handleResearch}>
          Improve
        </button>
      </div>
    </div>,
    anchorElement
  )
}
