// src/content/content.ts
import type { Segment } from '../types/transcript';

let transcript: Segment[] = [];

/** 1) Inject the external fetch-interceptor into the page context */
(() => {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('content/inject.js');
  s.onload = () => {
    console.log('🦆 fetch-interceptor injected');
    s.remove();
  };
  (document.head || document.documentElement).appendChild(s);
})();

/** 2) Listen for the real timedtext network response dispatched from the page */
window.addEventListener('YT_TIMEDTEXT', (ev: Event) => {
  const { url, body } = (ev as CustomEvent<{url: string; body: string}>).detail;
  console.log('🦆 Intercepted timedtext call:', url);

  // Try JSON3 first
  if (body.trim().startsWith('{')) {
    try {
      const data = JSON.parse(body) as { events?: { tStartMs?: number; segs?: { utf8: string }[] }[] };
      const events = Array.isArray(data.events) ? data.events : [];
      transcript = events.map(e => ({
        start: (e.tStartMs ?? 0) / 1000,
        text:  (e.segs ?? []).map(s => s.utf8).join('').trim()
      }));
      console.log(`🦆 Transcript (JSON3) loaded: ${transcript.length} segments`);
      return;
    } catch (parseErr) {
      console.error('❌ Failed to parse intercepted JSON3:', parseErr);
      // fallback to XML below
    }
  }

  // Fallback: XML parse
  transcript = parseXmlCaptions(body);
  console.log(`🦆 Transcript (XML) loaded: ${transcript.length} segments`);
});

/** Helper: parse XML timed-text into Segment[] */
function parseXmlCaptions(xmlText: string): Segment[] {
  const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
  return Array.from(xml.querySelectorAll('text')).map(node => ({
    start: parseFloat(node.getAttribute('start') ?? '0'),
    text:  node.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  }));
}

/** 3) Respond to messages from the popup */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'getTranscript') {
    sendResponse({ transcript });
  }
  else if (msg.action === 'seek' && typeof msg.time === 'number') {
    const time = msg.time;

    // 1) HTMLVideoElement
    const video = document.querySelector('video');
    if (video) {
      console.log('🦆 Seeking video.currentTime =', time);
      video.currentTime = time;
      return;
    }

    // 2) YouTube IFrame API player
    const ytPlayer = (window as any).YT?.get('movie_player');
    if (ytPlayer?.seekTo) {
      console.log('🦆 Seeking via YT Player API to', time);
      ytPlayer.seekTo(time, true);
      return;
    }

    // 3) Fallback: any element with seekTo
    const el = document.getElementById('movie_player') as any;
    if (el?.seekTo) {
      console.log('🦆 Seeking via container.seekTo to', time);
      el.seekTo(time, true);
      return;
    }

    console.warn('⚠️ Could not find a way to seek!');
  }
});
