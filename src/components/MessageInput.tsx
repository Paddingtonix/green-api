import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

interface MessageInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({
  onSend,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [message])

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

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form
      className="message-input"
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        disabled={disabled}
        rows={1}
        maxLength={4000}
        aria-label="Текст сообщения"
      />

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Отправить сообщение"
      >
        <span aria-hidden="true">↑</span>
      </button>
    </form>
  )
}
