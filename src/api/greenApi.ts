import type {
  CheckAccountResponse,
  DeleteNotificationResponse,
  GreenApiCredentials,
  GreenApiNotification,
  SendMessageResponse,
} from '../types/greenApi'

const API_URL =
  import.meta.env.VITE_GREEN_API_URL ?? 'https://api.green-api.com'

function buildUrl(
  credentials: GreenApiCredentials,
  method: string,
  suffix = '',
) {
  const { idInstance, apiTokenInstance } = credentials

  return `${API_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const message = await response.text()

    throw new Error(
      message || `GREEN-API request failed: ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}

export function checkAccount(
  credentials: GreenApiCredentials,
  phoneNumber: string,
) {
  return request<CheckAccountResponse>(
    buildUrl(credentials, 'checkAccount'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: Number(phoneNumber),
      }),
    },
  )
}

export function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
) {
  return request<SendMessageResponse>(
    buildUrl(credentials, 'sendMessage'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    },
  )
}

export async function receiveNotification(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<GreenApiNotification | null> {
  const response = await fetch(
    `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=30`,
    {
      signal,
    },
  )

  if (!response.ok) {
    const message = await response.text()

    throw new Error(
      message || `GREEN-API request failed: ${response.status}`,
    )
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text) as GreenApiNotification
}

export function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
) {
  return request<DeleteNotificationResponse>(
    buildUrl(
      credentials,
      'deleteNotification',
      `/${receiptId}`,
    ),
    {
      method: 'DELETE',
    },
  )
}