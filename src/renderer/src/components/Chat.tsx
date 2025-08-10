import { useLexicalEditorStore } from '@renderer/hooks/stores/useLexicalEditorStore'
import { useCurrentNote } from '@renderer/hooks/useCurrentNote'
import { streamChatResponse } from '@renderer/services/ai'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import Markdown from 'react-markdown'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const Chat = (): React.JSX.Element => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: title } = useCurrentNote({
    select: (note) => note.title
  })
  const getTextContent = useLexicalEditorStore((store) => store.getTextContent)

  const { mutate: sendMessage, isPending: isResponding } = useMutation({
    mutationFn: async (newMessages: ChatMessage[]) => {
      const content = await getTextContent()
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
    }
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      const message = formData.get('message') as string

      const newMessages = [
        ...messages,
        { id: crypto.randomUUID(), role: 'user', content: message }
      ] satisfies ChatMessage[]

      sendMessage(newMessages)
      setMessages(newMessages)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [messages, sendMessage]
  )

  const renderMessage = useCallback((message: ChatMessage): React.JSX.Element | null => {
    if (message.role === 'user') {
      return (
        <div key={message.id} className="px-4 flex flex-row justify-end">
          <div className="bg-blue-500 text-white p-2 px-4 rounded-lg max-w-4/5">
            {message.content}
          </div>
        </div>
      )
    }

    if (message.role === 'assistant') {
      return (
        <div key={message.id} className="px-4 flex flex-row justify-start">
          <div className="bg-gray-200 p-2 px-4 rounded-lg max-w-4/5 prose">
            <Markdown>{message.content}</Markdown>
          </div>
        </div>
      )
    }

    return null
  }, [])

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 overflow-y-auto gap-4 flex flex-col py-4">
        {messages.map(renderMessage)}
        {isResponding && (
          <div className="px-4 flex flex-row justify-start">
            <div className="bg-gray-200 p-2 px-4 rounded-lg max-w-4/5">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>
      <form id="chat-form" className="p-4 flex flex-row gap-2" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          name="message"
          className="w-full p-2 rounded-lg border border-gray-300"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 px-4 rounded-lg"
          disabled={isResponding}
        >
          Send
        </button>
      </form>
    </div>
  )
}
