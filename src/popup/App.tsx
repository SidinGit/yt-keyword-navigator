// src/popup/App.tsx
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import ResultsList from './ResultsList';
// import '../App.css';
import './popup.css'
import type { Segment } from '../types/transcript';

export default function App() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string|null>(null);

  useEffect(() => console.log('🔎 Popup mounted'), []);

  return (
    <div className="popup">
      <h1>YouTube Keyword Jump</h1>

      <SearchBar
        onResults={setSegments}
        onLoading={setLoading}
        onError={setError}
      />

      {loading && <p>Loading…</p>}
      {error   && <p className="error">{error}</p>}

      <ResultsList segments={segments} />
    </div>
  );
}
