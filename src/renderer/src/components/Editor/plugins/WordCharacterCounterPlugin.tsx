import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { countWords } from '@renderer/utils'
import { useEffect } from 'react'

export const WordCharacterCounterPlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerTextContentListener((text) => {
      const { words, characters } = countWords(text)
      console.log(words, characters)
    })
  }, [editor])

  return null
}
