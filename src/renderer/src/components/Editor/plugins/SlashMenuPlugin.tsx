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

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@renderer/utils'
import {
  LuCode,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuList,
  LuListChecks,
  LuListOrdered,
  LuText,
  LuTextQuote
} from 'react-icons/lu'
import { $createCodeNode } from '@lexical/code'

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
      icon: <LuText />,
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
          icon: (() => {
            switch (n) {
              case 1:
                return <LuHeading1 />
              case 2:
                return <LuHeading2 />
              case 3:
              default:
                return <LuHeading3 />
            }
          })(),
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`))
              }
            })
        })
    ),
    // new ComponentPickerOption('Table', {
    //   keywords: ['table'],
    //   onSelect: () => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '2', rows: '2' })
    // }),
    new ComponentPickerOption('Numbered List', {
      icon: <LuListOrdered />,
      keywords: ['numbered list', 'ordered list', 'ol'],
      onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }),
    new ComponentPickerOption('Bulleted List', {
      icon: <LuList />,
      keywords: ['bulleted list', 'unordered list', 'ul'],
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }),
    new ComponentPickerOption('Check List', {
      icon: <LuListChecks />,
      keywords: ['check list', 'todo list'],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    }),
    new ComponentPickerOption('Quote', {
      icon: <LuTextQuote />,
      keywords: ['block quote'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode())
          }
        })
    }),
    new ComponentPickerOption('Code', {
      icon: <LuCode />,
      keywords: ['code'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode())
          }
        })
      }
    })
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
      <ul className="min-w-[180px] rounded-lg border border-muted bg-background">
        {menuOptions.map((option, i) => (
          <li
            className={cn(
              `px-3 py-2 flex flex-row gap-2 items-center`,
              selectedIndex === i && 'bg-muted-light',
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
            {option.icon}
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
