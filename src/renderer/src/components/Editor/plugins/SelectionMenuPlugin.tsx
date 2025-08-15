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
  getDOMSelection,
  LexicalNode
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'

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
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null)
  const suggestionRefs = useRef<HTMLButtonElement[]>([])

  useHotkeys('up', () => {
    setSelectedSuggestionIndex((prev) => {
      if (prev === null) return 0
      return Math.max(prev - 1, 0)
    })
  })

  useHotkeys('down', () => {
    setSelectedSuggestionIndex((prev) => {
      if (prev === null) return 0
      return Math.min(prev + 1, suggestions.length - 1)
    })
  })

  useHotkeys('esc', () => {
    onClose()
  })

  useEffect(() => {
    if (suggestionRefs.current.length > 0 && selectedSuggestionIndex !== null) {
      suggestionRefs.current[selectedSuggestionIndex].focus()
    }
  }, [selectedSuggestionIndex])

  useEffect(() => {
    if (suggestions.length === 0) {
      setSelectedSuggestionIndex(null)
      suggestionRefs.current = []
    }
  }, [suggestions])

  return (
    <div className="rounded-lg border border-muted max-w-md">
      {isImproving && (
        <div className="p-2 px-3 text-left block w-full text-sm bg-background">
          <LoadingText text="Improving" />
        </div>
      )}
      {suggestions.map((suggestion, index) => (
        <AriaButton
          ref={(el) => {
            if (el) {
              suggestionRefs.current[index] = el
            }
          }}
          key={suggestion}
          className={cn(
            'p-2 px-3 text-left block w-full cursor-pointer outline-none bg-background focus:brightness-95 hover:brightness-95',
            index !== 0 && 'border-t border-muted'
          )}
          onPress={() => onPressMenuItem(suggestion)}
        >
          {suggestion}
        </AriaButton>
      ))}
    </div>
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
          <Button variant="primary" onPress={handleImprove}>
            Improve
          </Button>
        )}
      </div>
    </div>,
    anchorElement
  )
}
