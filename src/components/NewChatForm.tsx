import {
  useState,
  type FormEvent,
} from 'react'

import { checkAccount } from '../api/greenApi'
import type { ChatData } from '../types/chat'
import type { GreenApiCredentials } from '../types/greenApi'

interface NewChatFormProps {
  credentials: GreenApiCredentials
  onChatCreated: (chat: ChatData) => void
  onBack: () => void
}

export function NewChatForm({
  credentials,
  onChatCreated,
  onBack,
}: NewChatFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const normalizedPhone = phoneNumber.replace(/\D/g, '')

    if (!/^\d{10,15}$/.test(normalizedPhone)) {
      setError('Введите номер в международном формате')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const account = await checkAccount(
        credentials,
        normalizedPhone,
      )

      if (!account.exist || !account.chatId) {
        setError('Пользователь MAX не найден')
        return
      }

      onChatCreated({
        chatId: account.chatId,
        phoneNumber: normalizedPhone,
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не удалось проверить номер',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__header">
        <h1>Новый чат</h1>
        <p>
          Введите номер пользователя в международном формате
        </p>
      </div>

      <label className="field">
        <span>Номер телефона</span>

        <input
          type="tel"
          inputMode="numeric"
          value={phoneNumber}
          onChange={(event) =>
            setPhoneNumber(event.target.value)
          }
          placeholder="79991234567"
          autoFocus
        />
      </label>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        className="primary-button"
        type="submit"
        disabled={isLoading || !phoneNumber.trim()}
      >
        {isLoading ? 'Проверяем...' : 'Начать чат'}
      </button>

      <button
        className="secondary-button"
        type="button"
        onClick={onBack}
        disabled={isLoading}
      >
        Назад
      </button>
    </form>
  )
}
