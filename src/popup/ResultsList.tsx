// src/popup/ResultsList.tsx
import type { Segment } from '../types/transcript';
import { formatTime }   from '../utils/time';

interface Props {
  segments: Segment[];
}

export default function ResultsList({ segments }: Props) {
  if (segments.length === 0) {
    return <p className="no-matches">No matches</p>;
  }
                  

  return (
    <ul className="results-list">
      {segments.map((s, i) => (
        <li
          key={i}
          className="result-item"
          onClick={async () => {
            const [tab] = await chrome.tabs.query({
              active: true,
              currentWindow: true
            });
            // 1) send the seek command
            await chrome.tabs.sendMessage(tab.id!, {
              action: 'seek',
              time:   s.start
            });
            // 2) close the popup so you can see the jump
            window.close();
          }}
        >
          <span className="time">{formatTime(s.start)}</span>
          <span className="snippet">
            “…{s.text.slice(0, 40)}{s.text.length > 40 ? '…' : ''}”
          </span>
        </li>
      ))}
    </ul>
  );
}
