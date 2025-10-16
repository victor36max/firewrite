import { $getRoot, LexicalEditor } from 'lexical'
import { create } from 'zustand'
import { $convertToMarkdownString } from '@lexical/markdown'
import { DEFAULT_TRANSFORMERS } from '@lexical/react/LexicalMarkdownShortcutPlugin'

export const useLexicalEditorStore = create<{
  editor: LexicalEditor | null
  setEditor: (editor: LexicalEditor) => void
  getTextContent: () => Promise<string | null>
  getMarkdownContent: () => Promise<string | null>
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
  }
}))
