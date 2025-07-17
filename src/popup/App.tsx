import  { useState, useEffect } from 'react'
import SearchBar from './SearchBar'
import ResultsList from './ResultsList'
import './popup.css'
import type { Segment } from '../types/transcript'

const STORAGE_TERM_KEY    = 'ytkj_lastSearchTerm'
const STORAGE_RESULTS_KEY = 'ytkj_lastSearchResults'

export default function App() {
  const [keyword, setKeyword]   = useState<string>('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string|null>(null)

  // On popup open, load last search from localStorage
  useEffect(() => {
    const savedTerm = localStorage.getItem(STORAGE_TERM_KEY)
    const savedRes  = localStorage.getItem(STORAGE_RESULTS_KEY)
    if (savedTerm) {
      setKeyword(savedTerm)
    }
    if (savedRes) {
      try {
        setSegments(JSON.parse(savedRes))
      } catch { /* ignore parse errors */ }
    }
  }, [])

  // Called whenever SearchBar produces new hits
  const handleResults = (hits: Segment[]) => {
    setSegments(hits)
    // persist
    localStorage.setItem(STORAGE_TERM_KEY, keyword)
    localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(hits))
  }

  useEffect(() => console.log('🔎 Popup mounted'), [])

  return (
    <div className="popup">
      <h1>YouTube Keyword Jump</h1>

      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onResults={handleResults}
        onLoading={setLoading}
        onError={setError}
      />

      {loading && <p>Loading…</p>}
      {error   && <p className="error">{error}</p>}

      <ResultsList segments={segments} />
    </div>
  )
}
