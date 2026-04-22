import { useState } from 'react'
import PageHeader from './components/PageHeader'
import QuestionForm from './components/QuestionForm'
import ResponsePanel from './components/ResponsePanel'
import StatusPanel from './components/StatusPanel'
import { useApiStatus } from './hooks/useApiStatus'
import { askQuestion } from './services/documentService'
import type { AskResponse } from './types/api'

const DEFAULT_TOPIC = 'general'
const DEFAULT_INSTRUCTIONS =
  'Answer clearly and concisely. Keep the response to no more than 10 sentences. Only answer what you know. If you do not know, say "I do not know." If the request is vague, make the best reasonable interpretation.'

function App() {
  const { apiStatus, error } = useApiStatus()
  const [topic, setTopic] = useState(DEFAULT_TOPIC)
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState<AskResponse | null>(null)
  const [askError, setAskError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAsk = async () => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setAskError('Enter a question before sending it to the backend.')
      return
    }

    setIsSubmitting(true)
    setAskError(null)

    try {
      const data = await askQuestion({
        topic: topic.trim() || DEFAULT_TOPIC,
        prompt: trimmedPrompt,
        instructions: DEFAULT_INSTRUCTIONS,
      })

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
      <PageHeader />

      <section className="layout-grid">
        <QuestionForm
          topic={topic}
          prompt={prompt}
          isSubmitting={isSubmitting}
          error={askError}
          onTopicChange={setTopic}
          onPromptChange={setPrompt}
          onSubmit={handleAsk}
        />

        <div className="side-column">
          <ResponsePanel answer={answer} isSubmitting={isSubmitting} />
          <StatusPanel apiStatus={apiStatus} error={error} />
        </div>
      </section>
    </main>
  )
}

export default App
