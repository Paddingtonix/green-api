import { useState, type FormEvent } from 'react'

import type { GreenApiCredentials } from '../types/greenApi'

interface CredentialsFormProps {
  onSubmit: (credentials: GreenApiCredentials) => void
}

export function CredentialsForm({
  onSubmit,
}: CredentialsFormProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedIdInstance = idInstance.trim()
    const trimmedToken = apiTokenInstance.trim()

    if (!trimmedIdInstance || !trimmedToken) {
      return
    }

    onSubmit({
      idInstance: trimmedIdInstance,
      apiTokenInstance: trimmedToken,
    })
  }

  const isSubmitDisabled =
    !idInstance.trim() || !apiTokenInstance.trim()

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__header">
        <h1>GREEN-API MAX</h1>
        <p>Введите параметры доступа к вашему инстансу</p>
      </div>

      <label className="field">
        <span>ID Instance</span>

        <input
          value={idInstance}
          onChange={(event) => setIdInstance(event.target.value)}
          placeholder="Введите idInstance"
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>API Token Instance</span>

        <input
          type="password"
          value={apiTokenInstance}
          onChange={(event) =>
            setApiTokenInstance(event.target.value)
          }
          placeholder="Введите apiTokenInstance"
          autoComplete="off"
        />
      </label>

      <button
        className="primary-button"
        type="submit"
        disabled={isSubmitDisabled}
      >
        Продолжить
      </button>
    </form>
  )
}