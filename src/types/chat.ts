export interface ChatData {
  chatId: string
  phoneNumber: string
}

export interface ChatMessage {
  id: string
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: number
  status?: 'sending' | 'sent' | 'error'
  error?: string
}
