import { useState } from 'react'

import { sendMessage } from '../api/greenApi'

import type { GreenApiCredentials } from '../types/greenApi'
import type { ChatMessage } from '../types/chat'

import type { ChatData } from './NewChatForm'

import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatProps {
  credentials: GreenApiCredentials
  chat: ChatData
  onBack: () => void
}

export function Chat({
  credentials,
  chat,
  onBack,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async (text: string) => {
    const messageId = crypto.randomUUID()

    const newMessage: ChatMessage = {
      id: messageId,
      text,
      direction: 'outgoing',
      timestamp: Date.now(),
      status: 'sending',
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ])

    setIsSending(true)

    try {
      await sendMessage(
        credentials,
        chat.chatId,
        text,
      )

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status: 'sent',
              }
            : message,
        ),
      )
    } catch (error) {
      console.error(error)

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                status: 'error',
              }
            : message,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <button
          className="chat__back"
          type="button"
          onClick={onBack}
        >
          ←
        </button>

        <div>
          <strong>+{chat.phoneNumber}</strong>
          <div className="chat__subtitle">
            MAX
          </div>
        </div>
      </header>

      <MessageList messages={messages} />

      <MessageInput
        onSend={handleSendMessage}
        disabled={isSending}
      />
    </section>
  )
}