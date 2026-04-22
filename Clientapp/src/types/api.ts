export type ApiStatus = {
  application: string
  status: string
  features: string[]
  serverTimeUtc: string
}

export type AskRequest = {
  topic: string
  prompt: string
  instructions: string
}

export type AskResponse = {
  topic: string
  model: string
  content: string
  responseId?: string | null
}
