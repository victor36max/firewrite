import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuRenderFn,
  useBasicTypeaheadTriggerMatch
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  TextNode
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode } from '@lexical/rich-text'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@renderer/utils'

class ComponentPickerOption extends MenuOption {
  title: string
  icon?: React.JSX.Element
  keywords: Array<string>
  onSelect: (queryString: string) => void

  constructor(
    title: string,
    options: {
      icon?: React.JSX.Element
      keywords?: Array<string>
      keyboardShortcut?: string
      onSelect: (queryString: string) => void
    }
  ) {
    super(title)
    this.title = title
    this.keywords = options.keywords || []
    this.icon = options.icon
    this.onSelect = options.onSelect.bind(this)
  }
}

const getMenuOptions = (editor: LexicalEditor): Array<ComponentPickerOption> => {
  return [
    new ComponentPickerOption('Paragraph', {
      keywords: ['normal', 'paragraph', 'p', 'text'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode())
          }
        })
    }),
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, {
          keywords: ['heading', 'header', `h${n}`],
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`))
              }
            })
        })
    )
  ]
}

export const SlashMenuPlugin = (): React.JSX.Element => {
  const [editor] = useLexicalComposerContext()
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    allowWhitespace: true,
    minLength: 0
  })

  const menuOptions = getMenuOptions(editor)

  const handleSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove()
        selectedOption.onSelect(matchingString)
        closeMenu()
      })
    },
    [editor]
  )

  const renderMenu: MenuRenderFn<ComponentPickerOption> = (
    anchorElementRef,
    { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
  ) => {
    if (!anchorElementRef.current) return null
    return createPortal(
      <ul className="min-w-[120px] rounded-lg border border-muted">
        {menuOptions.map((option, i) => (
          <li
            className={cn(
              `px-3 py-2 bg-background`,
              selectedIndex === i && 'brightness-95',
              i !== 0 && 'border-t border-muted'
            )}
            key={option.title}
            onClick={() => {
              setHighlightedIndex(i)
              selectOptionAndCleanUp(option)
            }}
            onMouseEnter={() => {
              setHighlightedIndex(i)
            }}
          >
            {option.title}
          </li>
        ))}
      </ul>,
      anchorElementRef.current
    )
  }

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={() => {}}
      onSelectOption={handleSelectOption}
      options={menuOptions}
      menuRenderFn={renderMenu}
      triggerFn={checkForTriggerMatch}
    />
  )
}
