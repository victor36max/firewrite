import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import { Button } from '@renderer/components/primitives/Button'
import { LoadingText } from '@renderer/components/primitives/LoadingText'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { generateImprovementSuggestions } from '@renderer/services/ai'
import { cn, isValidUrl } from '@renderer/utils'
import { useMutation } from '@tanstack/react-query'
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  $setSelection,
  ElementNode,
  FORMAT_TEXT_COMMAND,
  getDOMSelection,
  LexicalNode,
  TextFormatType
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Form, Menu, MenuItem } from 'react-aria-components'
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  LuBold,
  LuCheck,
  LuCode,
  LuItalic,
  LuLink,
  LuPencilLine,
  LuSparkles,
  LuUnderline,
  LuX
} from 'react-icons/lu'
import { IconButton } from '@renderer/components/primitives/IconButton'
import { $isLinkNode, $toggleLink } from '@lexical/link'
import { Input } from '@renderer/components/primitives/Input'
import { useSettingsStore, selectIfLlmConfigured } from '@renderer/hooks/stores/useSettingsStore'
import { useToast } from '@renderer/hooks/useToast'
import { $convertToMarkdownString } from '@lexical/markdown'
import { $isCodeHighlightNode, $isCodeNode } from '@lexical/code'
import { DEFAULT_TRANSFORMERS } from '@lexical/react/LexicalMarkdownShortcutPlugin'

interface SelectionMenuPluginProps {
  anchorElement: HTMLDivElement | null
}

const findTopLevelNode = (node: LexicalNode) => {
  let current: LexicalNode | null = node
  while (current) {
    const parent = current.getParent()
    if ($isRootNode(parent)) {
      return current as ElementNode
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

const DEFAULT_PREFILLED_URL = 'https://'

export const SelectionMenuPlugin = ({
  anchorElement
}: SelectionMenuPluginProps): React.JSX.Element | null => {
  const selectionMenuRef = useRef<HTMLDivElement>(null)
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })
  const { showToast } = useToast()
  const isLlmConfigured = useSettingsStore(selectIfLlmConfigured)
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
  const [linkUrl, setLinkUrl] = useState<string | null>(null)
  const [prefilledUrl, setPrefilledUrl] = useState<string>(DEFAULT_PREFILLED_URL)
  const [linkUrlError, setLinkUrlError] = useState<string | null>(null)
  const [isCode, setIsCode] = useState(false)
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [isEditingLink, setIsEditingLink] = useState(false)

  const { mutate: improve, isPending: isImproving } = useMutation({
    mutationFn: generateImprovementSuggestions,
    onSuccess: setImprovementSuggestions,
    onError: (error) => {
      showToast({
        title: 'Error',
        description: error.message,
        variant: 'error'
      })
    }
  })

  useEffect(() => {
    if (!isOpen) {
      setImprovementSuggestions([])
      setIsCreatingLink(false)
      setIsEditingLink(false)
      setLinkUrl(null)
      setLinkUrlError(null)
    }
  }, [isOpen])

  const handleImprove = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection()
      if (!selection || !$isRangeSelection(selection)) {
        return
      }
      const rootNode = $getRoot()
      const topLevelNode = findTopLevelNode(selection.anchor.getNode())
      const selectionText = selection.getTextContent()

      improve({
        title: title || '',
        content: $convertToMarkdownString(DEFAULT_TRANSFORMERS, rootNode),
        paragraph: topLevelNode ? topLevelNode.getTextContent() : '',
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

  const handleToggleLink = useCallback(() => {
    if (linkUrl) {
      editor.update(() => {
        $toggleLink(null)
      })
    } else {
      editor.read(() => {
        const selection = $getSelection()
        if (!selection || !$isRangeSelection(selection)) {
          return
        }
        const selectionText = selection.getTextContent()
        if (isValidUrl(selectionText)) {
          setPrefilledUrl(selectionText)
        } else {
          setPrefilledUrl(DEFAULT_PREFILLED_URL)
        }

        setIsCreatingLink(true)
      })
    }
  }, [editor, linkUrl])

  const handleLinkSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.target as HTMLFormElement)
      const link = formData.get('link') as string

      if (!link || !isValidUrl(link)) {
        setLinkUrlError('Invalid URL')
        return
      }

      editor.update(() => {
        $toggleLink(link, {
          target: '_blank',
          rel: 'noreferrer'
        })
        $setSelection(null)
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
            $isCodeNode(selection.anchor.getNode()) ||
            $isCodeHighlightNode(selection.anchor.getNode())
          ) {
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
          setIsCode(selection.hasFormat('code'))

          const linkNode = $findMatchingParent(selection.anchor.getNode(), $isLinkNode)

          setLinkUrl(linkNode?.getURL() || null)

          setPosition({
            top: selectionRect.y + selectionRect.height - anchorRect.y,
            left: Math.min(
              selectionRect.x - anchorRect.x,
              anchorRect.width - (selectionMenuRef.current?.clientWidth || 0)
            )
          })

          setIsOpen(true)
        })
      })
    )
  }, [anchorElement, editor])

  if (!anchorElement) {
    return null
  }

  const renderFormattingMenu = () => {
    return (
      <div className="flex flex-row border border-muted rounded-lg">
        <IconButton
          variant="default"
          onPress={() => handleFormat('bold')}
          className={cn('rounded-none border-r border-muted', isBold && 'bg-muted-light')}
          iconClassName={cn('w-5 h-5', !isBold && 'text-muted-foreground')}
          Icon={LuBold}
          iconProps={{ strokeWidth: 2 }}
        />
        <IconButton
          onPress={() => handleFormat('italic')}
          className={cn('rounded-none border-r border-muted', isItalic && 'bg-muted-light')}
          iconClassName={cn('w-5 h-5', !isItalic && 'text-muted-foreground')}
          Icon={LuItalic}
          iconProps={{ strokeWidth: 2 }}
        />
        <IconButton
          onPress={() => handleFormat('underline')}
          className={cn('rounded-none border-r border-muted', isUnderline && 'bg-muted-light')}
          iconClassName={cn('w-5 h-5', !isUnderline && 'text-muted-foreground')}
          Icon={LuUnderline}
          iconProps={{ strokeWidth: 2 }}
        />
        <IconButton
          onPress={handleToggleLink}
          className={cn('rounded-none border-r border-muted', linkUrl && 'bg-muted-light')}
          iconClassName={cn('w-5 h-5', !linkUrl && 'text-muted-foreground')}
          Icon={LuLink}
          iconProps={{ strokeWidth: 2 }}
        />
        <IconButton
          onPress={() => handleFormat('code')}
          className={cn('rounded-none', isCode && 'bg-muted-light')}
          iconClassName={cn('w-5 h-5', !isCode && 'text-muted-foreground')}
          Icon={LuCode}
          iconProps={{ strokeWidth: 2 }}
        />
      </div>
    )
  }

  return createPortal(
    <div
      style={{ position: 'absolute', top: position?.top, left: position?.left }}
      className={cn(!isOpen && 'invisible pointer-events-none')}
      ref={selectionMenuRef}
    >
      <div className="mt-2 font-sans flex flex-col gap-2">
        {linkUrl && !isEditingLink && (
          <div className="flex flex-row gap-2 items-center bg-background border border-muted rounded-lg px-4 py-3">
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-primary flex-1"
            >
              {linkUrl}
            </a>
            <IconButton type="button" Icon={LuPencilLine} onPress={() => setIsEditingLink(true)} />
          </div>
        )}
        {(isCreatingLink || isEditingLink) && (
          <Form
            className="flex flex-row gap-2 items-center bg-background border border-muted rounded-lg p-2"
            onSubmit={handleLinkSubmit}
          >
            <div className="flex flex-col gap-1">
              <Input
                type="text"
                name="link"
                placeholder="Enter link"
                autoFocus={isCreatingLink}
                defaultValue={linkUrl || prefilledUrl}
                onChange={() => {
                  setLinkUrlError(null)
                }}
                isError={!!linkUrlError}
              />
              {linkUrlError && <i className="text-xs text-destructive">{linkUrlError}</i>}
            </div>
            <IconButton
              type="button"
              Icon={LuX}
              onPress={() => {
                setIsEditingLink(false)
                setIsCreatingLink(false)
                setLinkUrlError(null)
              }}
            />
            <IconButton type="submit" Icon={LuCheck} />
          </Form>
        )}
        {(improvementSuggestions.length > 0 || isImproving) && (
          <ImprovementSuggestionMenu
            suggestions={improvementSuggestions}
            isImproving={isImproving}
            onPressMenuItem={handleApplyImprovement}
            onClose={() => setIsOpen(false)}
          />
        )}
        {improvementSuggestions.length === 0 && !isImproving && !isCreatingLink && (
          <div className="flex flex-row gap-2 items-center">
            {renderFormattingMenu()}
            <Button
              variant="primary"
              onPress={handleImprove}
              isDisabled={!isLlmConfigured}
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
