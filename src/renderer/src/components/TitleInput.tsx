import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { useUpdateCurrentNote } from '@renderer/hooks/useUpdateCurrentNote'
import { useHotkeys } from 'react-hotkeys-hook'
import { useEffect, useRef, useState } from 'react'
import { useLexicalEditorStore } from '@renderer/hooks/stores/useLexicalEditorStore'

export const TitleInput = (): React.JSX.Element | null => {
  const ref = useRef<HTMLDivElement>(null)
  const prependNewParagraph = useLexicalEditorStore((store) => store.prependNewParagraph)
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })
  const [showPlaceholder, setShowPlaceholder] = useState(!title)

  useEffect(() => {
    setShowPlaceholder(!title)

    // add delay to ensure focus to be successful
    setTimeout(() => {
      if (ref.current && !title) {
        ref.current.focus()
      }
    }, 0)
  }, [title])

  const updateNote = useUpdateCurrentNote()

  useHotkeys(
    'enter',
    (e) => {
      if (document.activeElement !== ref.current) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      prependNewParagraph()
    },
    {
      enableOnContentEditable: true
    }
  )

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const currentRef = ref.current

    const handleInput = (e: Event) => {
      const currentTitle = (e.target as HTMLDivElement).textContent || ''
      setShowPlaceholder(!currentTitle)
    }

    const handleBlur = (e: FocusEvent) => {
      if (e.target !== currentRef) {
        return
      }
      const currentTitle = (e.target as HTMLDivElement).textContent || ''
      updateNote({ title: currentTitle })
    }

    currentRef.addEventListener('input', handleInput)
    currentRef.addEventListener('focusout', handleBlur)

    return () => {
      currentRef.removeEventListener('input', handleInput)
      currentRef.removeEventListener('focusout', handleBlur)
    }
  }, [updateNote])

  if (title === undefined) {
    return null
  }

  return (
    <div className="relative flex-1 overflow-hidden text-2xl font-serif font-semibold">
      {showPlaceholder && (
        <div className="absolute top-0 left-0 w-full text-muted-foreground pointer-events-none">
          Title
        </div>
      )}
      <div ref={ref} contentEditable className="whitespace-nowrap">
        {title}
      </div>
    </div>
  )
}
