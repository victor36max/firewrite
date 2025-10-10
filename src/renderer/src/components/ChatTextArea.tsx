import { useEffect, useRef } from 'react'
import type { AriaTextFieldProps } from 'react-aria'
import TextArea from 'react-textarea-autosize'
import { useTextField } from 'react-aria'
import { cn } from '@renderer/utils'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'

type ChatTextAreaProps = AriaTextFieldProps<HTMLTextAreaElement> & {
  className?: string
  onPressEnter?: () => void
}

export const ChatTextArea = ({ className, onPressEnter, ...props }: ChatTextAreaProps) => {
  const { data: noteTitle } = useCurrentNote({
    select: (note) => note.title
  })
  const ref = useRef<HTMLTextAreaElement>(null)
  const {
    inputProps: { style: inputStyle, className: inputClassName, ...inputProps }
  } = useTextField(
    {
      ...props,
      'aria-label': 'Chat text area',
      inputElementType: 'textarea',
      placeholder: noteTitle ? `Ask me anything about ${noteTitle}...` : 'Ask me anything...'
    },
    ref
  )

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') {
        return
      }

      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        onPressEnter?.()
      } else if (ref.current) {
        ref.current.value += '\n'
        // TODO: Hacky way to trigger textarea resize
        window.dispatchEvent(new Event('resize'))
      }
    }

    const currentRef = ref.current
    currentRef.addEventListener('keydown', handleKeyDown)

    return () => {
      currentRef.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <TextArea
      ref={ref}
      className={cn(
        'flex-1 p-2 rounded-lg border border-gray-300 outline-primary placeholder:text-muted-foreground',
        inputClassName,
        className
      )}
      minRows={1}
      maxRows={10}
      style={{
        ...inputStyle,
        height: inputStyle?.height !== undefined ? Number(inputStyle.height) : undefined
      }}
      {...inputProps}
    />
  )
}
