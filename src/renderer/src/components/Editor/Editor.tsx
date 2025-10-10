import { LexicalComposer } from '@lexical/react/LexicalComposer'

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListNode, ListItemNode } from '@lexical/list'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { CodeNode } from '@lexical/code'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { AutocompletePlugin } from './plugins/AutocompletePlugin'
import { AutocompleteNode } from '@renderer/components/Editor/nodes/AutocompleteNode'
// import TreeViewPlugin from './plugins/TreeViewPlugin'
import { SlashMenuPlugin } from './plugins/SlashMenuPlugin'
import { useCurrentNoteContent } from '@renderer/hooks/useCurrentNoteContent'
import { useState } from 'react'
import { SelectionMenuPlugin } from './plugins/SelectionMenuPlugin'
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin'
import { useLexicalEditorStore } from '@renderer/hooks/stores/useLexicalEditorStore'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { SavePlugin } from './plugins/SavePlugin'

export const Editor = (): React.JSX.Element | null => {
  const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null)
  const { data: noteContent } = useCurrentNoteContent()

  const setEditor = useLexicalEditorStore((store) => store.setEditor)

  if (!noteContent) {
    return null
  }

  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'firewrite-editor',
        nodes: [
          LinkNode,
          AutoLinkNode,
          ListNode,
          ListItemNode,
          TableNode,
          TableCellNode,
          TableRowNode,
          HorizontalRuleNode,
          CodeNode,
          HeadingNode,
          LinkNode,
          ListNode,
          ListItemNode,
          QuoteNode,
          AutocompleteNode
        ],
        theme: {
          autocomplete: 'text-muted-foreground',
          list: {
            listitemChecked: 'FWEditor__listItemChecked',
            listitemUnchecked: 'FWEditor__listItemUnchecked'
          },
          text: {
            bold: 'FWEditor__bold',
            italic: 'FWEditor__italic',
            underline: 'FWEditor__underline'
          }
        },
        editorState: noteContent.content || undefined,
        onError: (error) => {
          console.error(error)
        }
      }}
    >
      <EditorRefPlugin editorRef={setEditor} />
      <RichTextPlugin
        contentEditable={
          <div className="prose flex-1 relative" ref={setAnchorElement}>
            <ContentEditable
              aria-placeholder="Enter some text..."
              className="focus:outline-none caret-primary"
              placeholder={() => (
                <p className="text-muted-foreground absolute top-0 left-0 pointer-events-none">
                  Start writing, or press &quot;/&quot; for formatting options.
                </p>
              )}
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <SavePlugin />
      <HistoryPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <ListPlugin hasStrictIndent />
      <CheckListPlugin />
      <TablePlugin />
      <TabIndentationPlugin />
      {/* <TreeViewPlugin /> */}
      <SlashMenuPlugin />
      <AutocompletePlugin />
      <SelectionMenuPlugin anchorElement={anchorElement} />
      <LinkPlugin />
    </LexicalComposer>
  )
}
