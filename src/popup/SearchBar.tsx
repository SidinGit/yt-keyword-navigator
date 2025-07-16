import React, { useState } from 'react';
import type { Segment } from '../types/transcript';

interface Props {
  onResults: (hits: Segment[]) => void;
  onLoading?: (isLoading: boolean) => void;
  onError?:   (message: string | null) => void;
}

export default function SearchBar({ onResults, onLoading, onError }: Props) {
  const [kw, setKw] = useState('');

  const doSearch = async () => {
    onLoading?.(true);
    onError?.(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const { transcript } = await chrome.tabs.sendMessage(tab.id!, { action: 'getTranscript' });
      const hits: Segment[] = (transcript as Segment[]).filter(s =>
        s.text.toLowerCase().includes(kw.trim().toLowerCase())
      );
      onResults(hits);
    } catch (e: any) {
      onError?.(e.message || 'Search failed');
    } finally {
      onLoading?.(false);
    }
  };

  // handle both click *and* Enter
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={kw}
        onChange={e => setKw(e.target.value)}
        placeholder="Search keyword…"
        autoFocus
      />
      <button type="submit">Go</button>
    </form>
  );
}
