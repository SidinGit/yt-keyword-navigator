import React from 'react'
import type { Segment } from '../types/transcript'

interface Props {
  keyword:   string
  setKeyword: (kw: string) => void
  onResults: (hits: Segment[]) => void
  onLoading?: (isLoading: boolean) => void
  onError?:   (err: string | null) => void
}

export default function SearchBar({
  keyword,
  setKeyword,
  onResults,
  onLoading,
  onError
}: Props) {
  // escape regex chars
  const escapeRegex = (s: string) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const doSearch = async () => {
    const term = keyword.trim()
    if (!term) {
      onResults([])
      return
    }

    onLoading?.(true)
    onError?.(null)

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const { transcript } = await chrome.tabs.sendMessage(tab.id!, { action: 'getTranscript' })

      const pattern = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i')
      const hits: Segment[] = (transcript as Segment[]).filter(s =>
        pattern.test(s.text)
      )

      onResults(hits)
    } catch (e: any) {
      onError?.(e.message || 'Search failed')
    } finally {
      onLoading?.(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch()
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="Search keyword…"
        autoFocus
      />
      <button type="submit" disabled={!keyword.trim()}>
        Go
      </button>
    </form>
  )
}
