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
import TreeViewPlugin from './plugins/TreeViewPlugin'
import { SlashMenuPlugin } from './plugins/SlashMenuPlugin'

export const Editor = (): React.JSX.Element => {
  return (
    <div className="prose flex-1 flex flex-col">
      <LexicalComposer
        initialConfig={{
          namespace: 'MyEditor',
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
            autocomplete: 'text-gray-400'
          },
          onError: (error) => {
            console.error(error)
          }
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-placeholder="Enter some text..."
              className="focus:outline-none flex-1"
              placeholder={() => <p>Enter some text...</p>}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <ListPlugin hasStrictIndent />
        <AutocompletePlugin />
        <TabIndentationPlugin />
        <TreeViewPlugin />
        <SlashMenuPlugin />
      </LexicalComposer>
    </div>
  )
}
