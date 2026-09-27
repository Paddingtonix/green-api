import { useState } from 'react'

import { Chat } from './components/Chat'
import { CredentialsForm } from './components/CredentialsForm'
import { NewChatForm } from './components/NewChatForm'

import type { ChatData } from './types/chat'
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
      <Chat
        credentials={credentials}
        chat={chat}
        onBack={() => setChat(null)}
      />
    </main>
  )
}

export default App
