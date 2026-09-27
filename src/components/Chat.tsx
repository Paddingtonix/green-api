import { useEffect, useState } from 'react'

import {
  deleteNotification,
  receiveNotification,
  sendMessage,
} from '../api/greenApi'

import type { ChatMessage } from '../types/chat'
import type {
  GreenApiCredentials,
  IncomingTextMessageBody,
} from '../types/greenApi'

import type { ChatData } from './NewChatForm'

import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatProps {
  credentials: GreenApiCredentials
  chat: ChatData
  onBack: () => void
}

function isIncomingTextMessage(
  body: unknown,
): body is IncomingTextMessageBody {
  if (!body || typeof body !== 'object') {
    return false
  }

  const notification = body as Partial<IncomingTextMessageBody>

  return (
    notification.typeWebhook === 'incomingMessageReceived' &&
    notification.messageData?.typeMessage === 'textMessage' &&
    typeof notification.messageData.textMessageData?.textMessage ===
      'string' &&
    typeof notification.senderData?.chatId === 'string' &&
    typeof notification.idMessage === 'string' &&
    typeof notification.timestamp === 'number'
  )
}

export function Chat({
  credentials,
  chat,
  onBack,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const listen = async () => {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentials,
            controller.signal,
          )

          if (!notification) {
            continue
          }

          console.log(
            'GREEN-API notification:',
            notification,
          )

          const { body, receiptId } = notification

          if (isIncomingTextMessage(body)) {
            const currentChatId = String(chat.chatId)
            const incomingChatId = String(body.senderData.chatId)

            if (incomingChatId === currentChatId) {
              const incomingMessage: ChatMessage = {
                id: body.idMessage,
                text: body.messageData.textMessageData.textMessage,
                direction: 'incoming',
                timestamp: body.timestamp * 1000,
              }

              setMessages((currentMessages) => {
                const alreadyExists = currentMessages.some(
                  (message) => message.id === incomingMessage.id,
                )

                if (alreadyExists) {
                  return currentMessages
                }

                return [
                  ...currentMessages,
                  incomingMessage,
                ]
              })
            }
          }

          await deleteNotification(
            credentials,
            receiptId,
          )
        } catch (error) {
          if (controller.signal.aborted) {
            return
          }

          console.error(
            'Receive notification error:',
            error,
          )
        }
      }
    }

    void listen()

    return () => {
      controller.abort()
    }
  }, [
    credentials,
    chat.chatId,
  ])

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
      console.error(
        'Send message error:',
        error,
      )

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === localMessageId
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
          aria-label="Вернуться назад"
        >
          ←
        </button>

        <div>
          <strong>
            +{chat.phoneNumber}
          </strong>

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
