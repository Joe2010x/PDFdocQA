import { useEffect, useState } from 'react'
import { getApiStatus } from '../services/documentService'
import type { ApiStatus } from '../types/api'

const POLL_INTERVAL_MS = 10000

type UseApiStatusResult = {
  apiStatus: ApiStatus | null
  error: string | null
}

export function useApiStatus(): UseApiStatusResult {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadStatus = async () => {
      try {
        const data = await getApiStatus()

        if (!isMounted) {
          return
        }

        setApiStatus(data)
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to reach the backend API.'

        if (!isMounted) {
          return
        }

        setApiStatus(null)
        setError(message)
      }
    }

    void loadStatus()

    const intervalId = window.setInterval(() => {
      void loadStatus()
    }, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  return {
    apiStatus,
    error,
  }
}
