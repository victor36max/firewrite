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
import { useCurrentNoteIdStore } from '@renderer/hooks/stores/useCurrentNodeIdStore'
import { useNoteContentQuery } from '@renderer/hooks/queries/useNoteContentQuery'
import { SavePlugin } from './plugins/SavePlugin'

export const Editor = (): React.JSX.Element | null => {
  const { currentNoteId } = useCurrentNoteIdStore()
  const { data: noteContent } = useNoteContentQuery(currentNoteId || '', {
    enabled: !!currentNoteId
  })

  if (!currentNoteId || !noteContent) {
    return null
  }

  return (
    <div className="prose flex-1 flex flex-col relative">
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
          editorState: noteContent.content || undefined,
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
              placeholder={() => (
                <p className="text-gray-400 absolute top-0 left-0 pointer-events-none">
                  Enter some text...
                </p>
              )}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <SavePlugin />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <ListPlugin hasStrictIndent />
        <AutocompletePlugin />
        <TabIndentationPlugin />
        {/* <TreeViewPlugin /> */}
        <SlashMenuPlugin />
      </LexicalComposer>
    </div>
  )
}
