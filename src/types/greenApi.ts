export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
}

export interface CheckAccountResponse {
  exist: boolean
  chatId: string
  fromCache: boolean
}

export interface SendMessageResponse {
  idMessage: string
}

export interface DeleteNotificationResponse {
  result: boolean
  reason: string
}

export interface GreenApiNotification<TBody = unknown> {
  receiptId: number
  body: TBody
}

export interface IncomingTextMessageBody {
  typeWebhook: 'incomingMessageReceived'

  timestamp: number
  idMessage: string

  senderData: {
    chatId: string
    sender: string
    senderName: string
  }

  messageData: {
    typeMessage: 'textMessage'

    textMessageData: {
      textMessage: string
    }
  }
}
