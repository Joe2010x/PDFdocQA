import type { ApiStatus } from '../types/api'

type StatusPanelProps = {
  apiStatus: ApiStatus | null
  error: string | null
}

function StatusPanel({ apiStatus, error }: StatusPanelProps) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <p className="section-label">System</p>
          <h2>API status</h2>
        </div>
        {apiStatus ? <p className="status-badge neutral">{apiStatus.status}</p> : null}
      </div>

      {apiStatus ? (
        <>
          <div className="meta-row">
            <span>Application</span>
            <strong>{apiStatus.application}</strong>
          </div>
          <div className="meta-row">
            <span>Server time</span>
            <strong>{new Date(apiStatus.serverTimeUtc).toLocaleString()}</strong>
          </div>
          <ul className="feature-list">
            {apiStatus.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted-text">
          {error ?? 'Checking the backend endpoint through the Vite proxy.'}
        </p>
      )}
    </article>
  )
}

export default StatusPanel
