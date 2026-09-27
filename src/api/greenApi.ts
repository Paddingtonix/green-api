import type {
  CheckAccountResponse,
  DeleteNotificationResponse,
  GreenApiCredentials,
  GreenApiNotification,
  SendMessageResponse,
} from '../types/greenApi'

const API_URL = (
  import.meta.env.VITE_GREEN_API_URL ?? 'https://api.green-api.com'
).replace(/\/+$/, '')

function getApiErrorMessage(
  status: number,
  responseBody: string,
  fallbackMessage: string,
) {
  const normalizedDetails = responseBody.toLowerCase()

  if (normalizedDetails.includes('instance in starting process')) {
    return 'Инстанс запускается. Попробуйте позже'
  }

  if (
    normalizedDetails.includes('not authorized') ||
    normalizedDetails.includes('instance is starting')
  ) {
    return 'Инстанс не авторизован'
  }

  if (
    status === 401 ||
    status === 403 ||
    normalizedDetails.includes('unauthorized') ||
    normalizedDetails.includes('invalid token')
  ) {
    return 'Неверные данные доступа GREEN-API'
  }

  if (
    status === 466 ||
    /\b466\b/.test(normalizedDetails) ||
    normalizedDetails.includes('correspondentsstatus') ||
    normalizedDetails.includes('correspondents_quota_exceeded') ||
    normalizedDetails.includes('quota exceeded') ||
    normalizedDetails.includes('monthly quota')
  ) {
    return 'Достигнут лимит тарифа GREEN-API'
  }

  if (
    status === 469 ||
    normalizedDetails.includes('user get contact info limit reached')
  ) {
    return 'Достигнут лимит проверки пользователей. Попробуйте позже'
  }

  if (
    status === 429 ||
    normalizedDetails.includes('too many requests') ||
    normalizedDetails.includes('rate limit')
  ) {
    return 'Слишком много запросов к GREEN-API. Попробуйте позже'
  }

  return fallbackMessage
}

function parseApiResponse<T>(
  responseBody: string,
  status: number,
  fallbackMessage: string,
): T {
  let data: unknown

  try {
    data = JSON.parse(responseBody)
  } catch (error) {
    throw new Error(fallbackMessage, { cause: error })
  }

  if (data && typeof data === 'object') {
    const responseData = data as Record<string, unknown>

    if (responseData.status === false || responseData.status === 'error') {
      throw new Error(
        getApiErrorMessage(status, responseBody, fallbackMessage),
      )
    }
  }

  return data as T
}

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
  fallbackMessage: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, options)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new Error(fallbackMessage, { cause: error })
  }

  const responseBody = await response.text()

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        response.status,
        responseBody,
        fallbackMessage,
      ),
    )
  }

  return parseApiResponse<T>(
    responseBody,
    response.status,
    fallbackMessage,
  )
}

export function checkAccount(
  credentials: GreenApiCredentials,
  phoneNumber: string,
) {
  return request<CheckAccountResponse>(
    buildUrl(credentials, 'checkAccount'),
    'Не удалось проверить пользователя',
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
    'Не удалось отправить сообщение',
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
  let response: Response

  try {
    response = await fetch(
      `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=30`,
      {
        signal,
      },
    )
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new Error('Не удалось получить новые сообщения', {
      cause: error,
    })
  }

  if (!response.ok) {
    const responseBody = await response.text()

    throw new Error(
      getApiErrorMessage(
        response.status,
        responseBody,
        'Не удалось получить новые сообщения',
      ),
    )
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  return parseApiResponse<GreenApiNotification>(
    text,
    response.status,
    'Не удалось получить новые сообщения',
  )
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
    'Не удалось подтвердить получение сообщения',
    {
      method: 'DELETE',
    },
  )
}
