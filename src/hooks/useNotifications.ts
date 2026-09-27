import { useEffect, useState } from 'react'

import {
  deleteNotification,
  receiveNotification,
} from '../api/greenApi'

import type { ChatMessage } from '../types/chat'
import type {
  GreenApiCredentials,
  IncomingTextMessageBody,
  QuotaExceededBody,
} from '../types/greenApi'

interface UseNotificationsOptions {
  credentials: GreenApiCredentials
  chatId: string
  onMessage: (message: ChatMessage) => void
}

const INITIAL_RETRY_DELAY = 2_000
const MAX_RETRY_DELAY = 30_000

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

function isQuotaExceeded(body: unknown): body is QuotaExceededBody {
  return (
    !!body &&
    typeof body === 'object' &&
    (body as Partial<QuotaExceededBody>).typeWebhook === 'quotaExceeded'
  )
}

function waitBeforeRetry(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const handleAbort = () => {
      window.clearTimeout(timeoutId)
      resolve()
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}

export function useNotifications({
  credentials,
  chatId,
  onMessage,
}: UseNotificationsOptions) {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const listen = async () => {
      let retryDelay = INITIAL_RETRY_DELAY

      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentials,
            controller.signal,
          )

          if (!notification) {
            setError(null)
            retryDelay = INITIAL_RETRY_DELAY
            continue
          }

          const { body, receiptId } = notification

          if (isQuotaExceeded(body)) {
            setNotice('Достигнут лимит тарифа GREEN-API')
          } else if (
            isIncomingTextMessage(body) &&
            String(body.senderData.chatId) === String(chatId)
          ) {
            onMessage({
              id: body.idMessage,
              text: body.messageData.textMessageData.textMessage,
              direction: 'incoming',
              timestamp: body.timestamp * 1000,
            })
          }

          await deleteNotification(credentials, receiptId)

          setError(null)
          retryDelay = INITIAL_RETRY_DELAY
        } catch (caughtError) {
          if (controller.signal.aborted) {
            return
          }

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Не удалось получить новые сообщения',
          )

          await waitBeforeRetry(retryDelay, controller.signal)
          retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY)
        }
      }
    }

    void listen()

    return () => {
      controller.abort()
    }
  }, [credentials, chatId, onMessage])

  return { error, notice }
}
