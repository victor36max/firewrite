import {
  $createParagraphNode,
  $createRangeSelection,
  $getRoot,
  $setSelection,
  LexicalEditor
} from 'lexical'
import { create } from 'zustand'
import { $convertToMarkdownString } from '@lexical/markdown'
import { DEFAULT_TRANSFORMERS } from '@lexical/react/LexicalMarkdownShortcutPlugin'

export const useLexicalEditorStore = create<{
  editor: LexicalEditor | null
  setEditor: (editor: LexicalEditor) => void
  getTextContent: () => Promise<string | null>
  getMarkdownContent: () => Promise<string | null>
  prependNewParagraph: () => Promise<void>
}>()((set, get) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
  getTextContent: async () => {
    const { editor } = get()
    if (!editor) {
      return null
    }

    return new Promise((resolve) => {
      editor.read(() => {
        resolve($getRoot().getTextContent())
      })
    })
  },
  getMarkdownContent: async () => {
    const { editor } = get()
    if (!editor) {
      return null
    }

    return new Promise((resolve) => {
      editor.read(() => {
        resolve($convertToMarkdownString(DEFAULT_TRANSFORMERS))
      })
    })
  },
  prependNewParagraph: () => {
    const { editor } = get()
    if (!editor) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      editor.update(() => {
        const root = $getRoot()
        const firstChild = root.getFirstChild()
        const node = $createParagraphNode()
        if (!firstChild) {
          root.append(node)
        } else {
          firstChild.insertBefore(node)
        }
        const newSelection = $createRangeSelection()
        newSelection.insertNodes([node])
        $setSelection(newSelection)
        resolve()
      })
    })
  }
}))
