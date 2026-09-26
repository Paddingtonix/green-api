import { useState } from 'react'

import { CredentialsForm } from './components/CredentialsForm'
import {
  NewChatForm,
  type ChatData,
} from './components/NewChatForm'

import type { GreenApiCredentials } from './types/greenApi'

import './App.css'

function App() {
  const [credentials, setCredentials] =
    useState<GreenApiCredentials | null>(null)

  const [chat, setChat] =
    useState<ChatData | null>(null)

  if (!credentials) {
    return (
      <main className="app">
        <CredentialsForm
          onSubmit={setCredentials}
        />
      </main>
    )
  }

  if (!chat) {
    return (
      <main className="app">
        <NewChatForm
          credentials={credentials}
          onChatCreated={setChat}
          onBack={() => setCredentials(null)}
        />
      </main>
    )
  }

  return (
    <main className="app">
      <div className="form-card">
        <h1>Чат готов</h1>

        <p>
          Phone: {chat.phoneNumber}
        </p>

        <p>
          Chat ID: {chat.chatId}
        </p>
      </div>
    </main>
  )
}

export default App