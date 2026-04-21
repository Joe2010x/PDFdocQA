import { useEffect, useState } from 'react'

type ApiStatus = {
  application: string
  status: string
  features: string[]
  serverTimeUtc: string
}

type AskResponse = {
  topic: string
  model: string
  content: string
  responseId?: string | null
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [topic, setTopic] = useState('general')
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState<AskResponse | null>(null)
  const [askError, setAskError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch('/api/documents/status')

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as ApiStatus
        setApiStatus(data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to reach the backend API.'
        setError(message)
      }
    }

    void loadStatus()
  }, [])

  const handleAsk = async () => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setAskError('Enter a question before sending it to the backend.')
      return
    }

    setIsSubmitting(true)
    setAskError(null)

    try {
      const response = await fetch('/api/documents/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim() || 'general',
          prompt: trimmedPrompt,
          instructions:
            'Answer clearly and concisely. Keep the response to no more than 10 sentences. Only answer what you know. If you do not know, say "I do not know." If the request is vague, make the best reasonable interpretation.',
        }),
      })

      if (!response.ok) {
        const problem = (await response.json().catch(() => null)) as
          | { detail?: string }
          | null

        throw new Error(
          problem?.detail ?? `Request failed with status ${response.status}`,
        )
      }

      const data = (await response.json()) as AskResponse
      setAnswer(data)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to get a response from the backend.'
      setAskError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">DocumentQandA Starter</p>
        <h1>Ask a question and let the backend call OpenAI for the answer.</h1>
        <p className="hero-copy">
          Type a prompt below, send it to the ASP.NET Core API, and the API will
          forward it to your configured language model using the stored
          <code> OpenAIKey </code>
          and
          <code> ModelName </code>
          secrets.
        </p>

        <div className="hero-actions">
          <a className="primary-link" href="http://localhost:5000/swagger">
            Swagger UI
          </a>
          <a className="secondary-link" href="http://localhost:5000/openapi/v1.json">
            API schema
          </a>
        </div>
      </section>

      <section className="content-grid">
        <article className="info-card">
          <h2>Ask the model</h2>
          <label className="field-label" htmlFor="topic">
            Topic
          </label>
          <input
            id="topic"
            className="topic-input"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="general"
          />
          <label className="field-label" htmlFor="question">
            Prompt
          </label>
          <textarea
            id="question"
            className="prompt-input"
            rows={7}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: Explain how a document Q&A application should handle uploaded PDFs."
          />
          <div className="ask-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleAsk}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Asking OpenAI...' : 'Send question'}
            </button>
          </div>
          {askError ? <p className="error-text">{askError}</p> : null}
        </article>

        <article className="info-card response-card">
          <h2>Model response</h2>
          {answer ? (
            <>
              <p className="status-pill">Response ready</p>
              <p className="muted">Topic: {answer.topic}</p>
              <p className="status-name">{answer.model}</p>
              <div className="answer-body">{answer.content}</div>
            </>
          ) : (
            <p className="muted">
              {isSubmitting
                ? 'Waiting for the backend to return the model output...'
                : 'Your answer will appear here after you submit a prompt.'}
            </p>
          )}
        </article>

        <article className="info-card status-card">
          <h2>API connection</h2>
          {apiStatus ? (
            <>
              <p className="status-pill">{apiStatus.status}</p>
              <p className="status-name">{apiStatus.application}</p>
              <p className="muted">
                Server time: {new Date(apiStatus.serverTimeUtc).toLocaleString()}
              </p>
              <ul>
                {apiStatus.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">
              {error ?? 'Checking the backend endpoint through the Vite proxy...'}
            </p>
          )}
        </article>
      </section>
    </main>
  )
}

export default App
