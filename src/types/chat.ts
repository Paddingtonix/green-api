export interface ChatMessage {
  id: string
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: number
  status?: 'sending' | 'sent' | 'error'
}