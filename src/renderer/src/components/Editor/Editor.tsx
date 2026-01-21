import { LexicalComposer } from '@lexical/react/LexicalComposer'

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import {
  MarkdownShortcutPlugin,
  DEFAULT_TRANSFORMERS
} from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListNode, ListItemNode } from '@lexical/list'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
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
import CodeHighlightPrismPlugin from './plugins/CodeHighlightPrismPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { TableActionMenuPlugin } from './plugins/TableActionMenuPlugin'
import { InsertTableMenuPlugin } from './plugins/InsertTableMenuPlugin'
import { TableCellActionNode } from './nodes/TableCellActionNode'
import { TableCellActionPlugin } from './plugins/TableCellActionPlugin'

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
          TableCellActionNode,
          HorizontalRuleNode,
          CodeNode,
          HeadingNode,
          LinkNode,
          ListNode,
          ListItemNode,
          QuoteNode,
          AutocompleteNode,
          CodeHighlightNode
        ],
        theme: {
          list: {
            listitemChecked: 'fw-checklist-item fw-checked',
            listitemUnchecked: 'fw-checklist-item'
          },
          text: {
            bold: 'font-semibold',
            italic: 'italic',
            underline: 'underline'
          },
          codeHighlight: {
            atrule: 'fw-keyword',
            attr: 'fw-attr',
            'attr-name': 'fw-property',
            'attr-value': 'fw-attr',
            boolean: 'fw-property',
            builtin: 'fw-attr',
            cdata: 'fw-comment',
            char: 'fw-attr',
            class: 'fw-function',
            'class-name': 'fw-function',
            comment: 'fw-comment',
            constant: 'fw-property',
            deleted: 'fw-property',
            doctype: 'fw-comment',
            entity: 'fw-operator',
            function: 'fw-function',
            important: 'fw-variable',
            inserted: 'fw-attr',
            keyword: 'fw-keyword',
            namespace: 'fw-variable',
            number: 'fw-property',
            operator: 'fw-operator',
            prolog: 'fw-comment',
            property: 'fw-property',
            punctuation: 'fw-punctuation',
            regex: 'fw-variable',
            selector: 'fw-selector',
            string: 'fw-attr',
            symbol: 'fw-property',
            tag: 'fw-selector',
            url: 'fw-operator',
            variable: 'fw-variable',
            def: 'fw-property'
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
          <div className="prose relative" ref={setAnchorElement}>
            <ContentEditable
              aria-placeholder="Enter some text..."
              className="fw-content-root"
              placeholder={() => (
                // -z-10 is needed to prevent the placeholder showing up on top of the floating menus of the editor
                <p className="text-muted-foreground absolute -top-4 left-0 pointer-events-none -z-10">
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
      <MarkdownShortcutPlugin transformers={DEFAULT_TRANSFORMERS} />
      <ListPlugin hasStrictIndent />
      <CheckListPlugin />
      <TablePlugin />
      <TabIndentationPlugin />
      {/* <TreeViewPlugin /> */}
      <SlashMenuPlugin />
      <AutocompletePlugin />
      <SelectionMenuPlugin anchorElement={anchorElement} />
      <InsertTableMenuPlugin anchorElement={anchorElement} />
      <TableCellActionPlugin />
      <TableActionMenuPlugin anchorElement={anchorElement} />
      <LinkPlugin />
      <CodeHighlightPrismPlugin anchorElement={anchorElement} />
      <HorizontalRulePlugin />
      <ClickableLinkPlugin />
    </LexicalComposer>
  )
}
