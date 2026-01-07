import { LexicalEditor } from 'lexical'
import { $getNodeByKey } from 'lexical'
import { $isTableCellNode } from '@lexical/table'
import { OPEN_TABLE_ACTION_MENU_COMMAND } from '@renderer/components/Editor/plugins/table-commands'
import { LuChevronDown } from 'react-icons/lu'

export const TableCellActionButton = ({
  editor,
  nodeKey
}: {
  editor: LexicalEditor
  nodeKey: string
}): React.JSX.Element => {
  const dispatch = () => {
    let cellKey: string | null = null
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey)
      if (!node) return

      let parent = node.getParent()
      while (parent && !$isTableCellNode(parent)) {
        parent = parent.getParent()
      }
      if (!parent) return

      cellKey = parent.getKey()
    })
    if (cellKey) {
      editor.dispatchCommand(OPEN_TABLE_ACTION_MENU_COMMAND, { cellKey })
    }
  }

  return (
    <button
      type="button"
      className="fw-table-cell-action-button"
      contentEditable={false}
      tabIndex={-1}
      aria-label="Table actions"
      onPointerDown={(e) => {
        // Avoid stealing selection/focus from the editor while still allowing click.
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch()
      }}
    >
      <LuChevronDown className="w-4 h-4" />
    </button>
  )
}
