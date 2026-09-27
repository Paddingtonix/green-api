import { useCallback, useState } from 'react'

import { sendMessage } from '../api/greenApi'
import { useNotifications } from '../hooks/useNotifications'

import type { ChatData, ChatMessage } from '../types/chat'
import type { GreenApiCredentials } from '../types/greenApi'

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

  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    setMessages((currentMessages) => {
      const alreadyExists = currentMessages.some(
        (currentMessage) => currentMessage.id === message.id,
      )

      return alreadyExists
        ? currentMessages
        : [...currentMessages, message]
    })
  }, [])

  const {
    error: notificationsError,
    notice: notificationsNotice,
  } = useNotifications({
    credentials,
    chatId: chat.chatId,
    onMessage: handleIncomingMessage,
  })

  const handleSendMessage = async (
    text: string,
  ) => {
    const localMessageId = crypto.randomUUID()

    const newMessage: ChatMessage = {
      id: localMessageId,
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
      const response = await sendMessage(
        credentials,
        chat.chatId,
        text,
      )

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === localMessageId
            ? {
                ...message,
                id: response.idMessage || message.id,
                status: 'sent',
              }
            : message,
        ),
      )
    } catch (error) {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === localMessageId
            ? {
                ...message,
                status: 'error',
                error:
                  error instanceof Error
                    ? error.message
                    : 'Не удалось отправить сообщение',
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
          aria-label="Вернуться назад"
        >
          ←
        </button>

        <div className="chat__avatar" aria-hidden="true">
          M
        </div>

        <div>
          <strong className="chat__title">
            +{chat.phoneNumber}
          </strong>

          <div className="chat__subtitle">
            MAX
          </div>
        </div>
      </header>

      {(notificationsError || notificationsNotice) && (
        <div className="chat__notice" role="status">
          {notificationsError
            ? `${notificationsError}. Повторяем попытку…`
            : notificationsNotice}
        </div>
      )}

      <MessageList messages={messages} />

      <MessageInput
        onSend={handleSendMessage}
        disabled={isSending}
      />
    </section>
  )
}
