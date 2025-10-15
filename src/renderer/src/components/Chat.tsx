import { useLexicalEditorStore } from '@renderer/hooks/stores/useLexicalEditorStore'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { streamChatResponse } from '@renderer/services/ai'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { IconButton } from './primitives/IconButton'
import { LuArrowUp } from 'react-icons/lu'
import { ChatTextArea } from './ChatTextArea'
import { LoadingText } from './primitives/LoadingText'
import { Form } from 'react-aria-components'
import { useSettingsStore, selectIfLlmConfigured } from '@renderer/hooks/stores/useSettingsStore'
import { useToast } from '@renderer/hooks/useToast'
import rehypeExternalLinks from 'rehype-external-links'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const Chat = (): React.JSX.Element => {
  const { showToast } = useToast()
  const scrollViewRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })
  const getMarkdownContent = useLexicalEditorStore((store) => store.getMarkdownContent)
  const isLlmConfigured = useSettingsStore(selectIfLlmConfigured)
  const { mutate: sendMessage, isPending: isResponding } = useMutation({
    mutationFn: async (newMessages: ChatMessage[]) => {
      const content = await getMarkdownContent()
      return streamChatResponse({
        title: title || '',
        content: content || '',
        messages: newMessages
      })
    },
    onSuccess: async ({ textStream }) => {
      const currentMessages = [...messages]
      const messageId = crypto.randomUUID()
      let currentMessage = ''
      for await (const chunk of textStream) {
        currentMessage += chunk
        setMessages([
          ...currentMessages,
          { id: messageId, role: 'assistant', content: currentMessage }
        ])
      }
    },
    onError: (error) => {
      showToast({
        title: 'Error',
        description: error.message,
        variant: 'error'
      })
    }
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const formElement = e.target as HTMLFormElement
      const formData = new FormData(formElement)
      const message = formData.get('message')
      if (!message || typeof message !== 'string') {
        return
      }

      const normalizedMessage = message.trim()

      if (normalizedMessage.length === 0) {
        return
      }

      const newMessages = [
        ...messages,
        { id: crypto.randomUUID(), role: 'user', content: normalizedMessage }
      ] satisfies ChatMessage[]

      sendMessage(newMessages)
      setMessages(newMessages)

      formElement.reset()
    },
    [messages, sendMessage]
  )

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        top: scrollViewRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  const renderMessage = useCallback((message: ChatMessage): React.JSX.Element | null => {
    if (message.role === 'user') {
      return (
        <div key={message.id} className="px-6 flex flex-row justify-end">
          <div className="border border-muted p-2 px-3 rounded-2xl max-w-4/5">
            <Markdown>{message.content}</Markdown>
          </div>
        </div>
      )
    }

    if (message.role === 'assistant') {
      return (
        <div key={message.id} className="px-6 flex flex-row justify-start">
          <div className="prose !font-sans">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
              ]}
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  return match ? (
                    <SyntaxHighlighter
                      className="rounded-md text-sm FWSyntaxHighlighter"
                      PreTag="div"
                      language={language}
                      style={oneDark}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </Markdown>
          </div>
        </div>
      )
    }

    return null
  }, [])

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-y-auto gap-4 flex flex-col py-4" ref={scrollViewRef}>
        {messages.map(renderMessage)}
        {isResponding && (
          <div className="px-6 flex flex-row justify-start">
            <LoadingText text="Thinking" />
          </div>
        )}
      </div>
      <Form
        ref={formRef}
        className="py-4 px-6 flex flex-row gap-2 items-center bg-background border-t border-muted"
        onSubmit={handleSubmit}
      >
        <ChatTextArea
          name="message"
          isRequired
          minLength={1}
          onPressEnter={() => {
            formRef.current?.requestSubmit()
          }}
        />
        <IconButton
          type="submit"
          isDisabled={isResponding || !isLlmConfigured}
          Icon={LuArrowUp}
          className="rounded-full"
          variant="primary"
        />
      </Form>
    </div>
  )
}
