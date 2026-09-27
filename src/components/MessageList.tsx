import { useEffect, useRef } from 'react'

import type { ChatMessage } from '../types/chat'

interface MessageListProps {
  messages: ChatMessage[]
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function MessageList({
  messages,
}: MessageListProps) {
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="message-list message-list--empty">
        <p>Сообщений пока нет</p>
      </div>
    )
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message message--${message.direction}`}
        >
          <div className="message__bubble">
            <div className="message__text">
              {message.text}
            </div>

            <div className="message__meta">
              <span>
                {formatTime(message.timestamp)}
              </span>

              {message.direction === 'outgoing' &&
                message.status === 'sending' && (
                  <span>Отправка...</span>
                )}

              {message.direction === 'outgoing' &&
                message.status === 'error' && (
                  <span className="message__error-mark" aria-hidden="true">
                    !
                  </span>
                )}
            </div>

            {message.status === 'error' && (
              <div className="message__error" role="alert">
                {message.error ?? 'Не удалось отправить сообщение'}
              </div>
            )}
          </div>
        </div>
      ))}

      <div ref={listEndRef} />
    </div>
  )
}
