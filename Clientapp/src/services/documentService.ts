import type { ApiStatus, AskRequest, AskResponse } from '../types/api'

const STATUS_ENDPOINT = '/api/documents/status'
const ASK_ENDPOINT = '/api/documents/ask'

async function parseError(response: Response): Promise<never> {
  const problem = (await response.json().catch(() => null)) as
    | { detail?: string }
    | null

  throw new Error(
    problem?.detail ?? `Request failed with status ${response.status}`,
  )
}

export async function getApiStatus(): Promise<ApiStatus> {
  const response = await fetch(STATUS_ENDPOINT)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as ApiStatus
}

export async function askQuestion(request: AskRequest): Promise<AskResponse> {
  const response = await fetch(ASK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as AskResponse
}
