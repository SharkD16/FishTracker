import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState({ state: 'loading' })

  async function checkApi() {
    setApiStatus({ state: 'loading' })

    try {
      const response = await fetch('/api/status')

      if (!response.ok) {
        throw new Error(`The API returned ${response.status}.`)
      }

      setApiStatus({ state: 'success', data: await response.json() })
    } catch (error) {
      setApiStatus({ state: 'error', message: error.message })
    }
  }

  useEffect(() => {
    checkApi()
  }, [])

  return (
    <main className="app">
      <p className="eyebrow">FishTracker</p>
      <h1>Local API check</h1>
      <p className="description">
        This page verifies that the React client can reach the local API and its SQLite database.
      </p>

      <section className="status-card" aria-live="polite">
        {apiStatus.state === 'loading' && <p>Checking the API…</p>}

        {apiStatus.state === 'success' && (
          <>
            <span className="status success">Connected</span>
            <p>The API is running and the {apiStatus.data.database} database is available.</p>
          </>
        )}

        {apiStatus.state === 'error' && (
          <>
            <span className="status error">Not connected</span>
            <p>{apiStatus.message}</p>
            <p className="hint">Start the API at http://localhost:5554, then try again.</p>
          </>
        )}
      </section>

      <button type="button" onClick={checkApi}>Check again</button>
    </main>
  )
}

export default App
