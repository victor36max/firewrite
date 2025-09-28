import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { Button } from '@renderer/components/primitives/Button'
import { LoadingText } from '@renderer/components/primitives/LoadingText'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { generateImprovementSuggestions } from '@renderer/services/ai'
import { cn } from '@renderer/utils'
import { useMutation } from '@tanstack/react-query'
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  LexicalNode,
  TextFormatType
} from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import { Menu, MenuItem } from 'react-aria-components'
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { LuSparkles } from 'react-icons/lu'
import { GrBold, GrUnderline, GrItalic } from 'react-icons/gr'
import { IconButton } from '@renderer/components/primitives/IconButton'

interface SelectionMenuPluginProps {
  anchorElement: HTMLDivElement | null
}

const findTopLevelNode = (node: LexicalNode) => {
  let current: LexicalNode | null = node
  while (current) {
    const parent = current.getParent()
    if ($isRootNode(parent)) {
      return current
    }
    current = parent
  }
  return null
}

const ImprovementSuggestionMenu = ({
  suggestions,
  isImproving,
  onPressMenuItem,
  onClose
}: {
  suggestions: string[]
  isImproving: boolean
  onPressMenuItem: (suggestion: string) => void
  onClose: () => void
}) => {
  useHotkeys('esc', () => {
    onClose()
  })

  return (
    <Menu
      aria-label="Improvement Suggestions"
      className="rounded-lg border border-muted max-w-md bg-background outline-none"
    >
      {isImproving && (
        <MenuItem aria-label="Improving" className="p-2 px-3 text-left block w-full text-sm">
          <LoadingText text="Improving" />
        </MenuItem>
      )}
      {suggestions.map((suggestion, index) => (
        <MenuItem
          aria-label={suggestion}
          id={suggestion}
          key={suggestion}
          className={({ isFocused, isHovered }) =>
            cn(
              'p-2 px-3 text-left block w-full cursor-pointer outline-none',
              index !== 0 && 'border-t border-muted',
              isFocused && 'bg-muted-light',
              isHovered && 'bg-muted-light'
            )
          }
          onAction={() => onPressMenuItem(suggestion)}
        >
          {suggestion}
        </MenuItem>
      ))}
    </Menu>
  )
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
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([])
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const { mutate: improve, isPending: isImproving } = useMutation({
    mutationFn: generateImprovementSuggestions,
    onSuccess: setImprovementSuggestions
  })

  useEffect(() => {
    if (!isOpen) {
      setImprovementSuggestions([])
    }
  }, [isOpen])

  const handleImprove = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection()
      if (!selection || !$isRangeSelection(selection)) {
        return
      }
      const content = $getRoot().getTextContent()
      const paragraph = findTopLevelNode(selection.anchor.getNode())?.getTextContent() || ''
      const selectionText = selection.getTextContent()

      improve({
        title: title || '',
        content,
        paragraph,
        selection: selectionText
      })
    })
  }, [editor, improve, title])

  const handleApplyImprovement = useCallback(
    (suggestion: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!selection) return
        selection.insertText(suggestion)
      })
    },
    [editor]
  )

  const handleFormat = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    },
    [editor]
  )

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

          setIsBold(selection.hasFormat('bold'))
          setIsItalic(selection.hasFormat('italic'))
          setIsUnderline(selection.hasFormat('underline'))

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

  const renderFormattingMenu = () => {
    return (
      <div className="flex flex-row border border-muted rounded-lg">
        <IconButton
          variant="default"
          onPress={() => handleFormat('bold')}
          className={cn(isBold && 'bg-muted-light')}
          iconClassName={cn(!isBold && 'text-muted-foreground')}
          Icon={GrBold}
          iconProps={{ strokeWidth: 0.5 }}
        />
        <div className="w-px h-full bg-muted" />
        <IconButton
          onPress={() => handleFormat('italic')}
          className={cn(isItalic && 'bg-muted-light')}
          iconClassName={cn(!isItalic && 'text-muted-foreground')}
          Icon={GrItalic}
          iconProps={{ strokeWidth: 0.5 }}
        />
        <div className="w-px h-full bg-muted" />
        <IconButton
          onPress={() => handleFormat('underline')}
          className={cn(isUnderline && 'bg-muted-light')}
          iconClassName={cn(!isUnderline && 'text-muted-foreground')}
          Icon={GrUnderline}
          iconProps={{ strokeWidth: 0.5 }}
        />
      </div>
    )
  }

  return createPortal(
    <div style={{ position: 'absolute', top: position?.top, left: position?.left }}>
      <div className="mt-2 font-sans">
        {(improvementSuggestions.length > 0 || isImproving) && (
          <ImprovementSuggestionMenu
            suggestions={improvementSuggestions}
            isImproving={isImproving}
            onPressMenuItem={handleApplyImprovement}
            onClose={() => setIsOpen(false)}
          />
        )}
        {improvementSuggestions.length === 0 && !isImproving && (
          <div className="flex flex-row gap-2">
            {renderFormattingMenu()}
            <Button
              variant="primary"
              onPress={handleImprove}
              className="flex flex-row gap-2 items-center"
            >
              <LuSparkles className="w-4 h-4" />
              Improve
            </Button>
          </div>
        )}
      </div>
    </div>,
    anchorElement
  )
}
