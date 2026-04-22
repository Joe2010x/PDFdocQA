import type { AskResponse } from '../types/api'

type ResponsePanelProps = {
  answer: AskResponse | null
  isSubmitting: boolean
}

function ResponsePanel({ answer, isSubmitting }: ResponsePanelProps) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <p className="section-label">Output</p>
          <h2>Response</h2>
        </div>
        {answer ? <p className="status-badge">Ready</p> : null}
      </div>

      {answer ? (
        <>
          <div className="meta-row">
            <span>Topic</span>
            <strong>{answer.topic}</strong>
          </div>
          <div className="meta-row">
            <span>Model</span>
            <strong>{answer.model}</strong>
          </div>
          <div className="answer-body">{answer.content}</div>
        </>
      ) : (
        <p className="muted-text">
          {isSubmitting
            ? 'Waiting for the backend to return a response.'
            : 'Your answer will appear here after you submit a prompt.'}
        </p>
      )}
    </article>
  )
}

export default ResponsePanel
