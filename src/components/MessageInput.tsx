import { useState, type FormEvent } from 'react'

interface MessageInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({
  onSend,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || disabled) {
      return
    }

    setMessage('')

    await onSend(trimmedMessage)
  }

  return (
    <form
      className="message-input"
      onSubmit={handleSubmit}
    >
      <input
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        placeholder="Введите сообщение..."
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Отправить сообщение"
      >
        Отправить
      </button>
    </form>
  )
}