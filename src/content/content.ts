// src/content/content.ts
import type { Segment } from '../types/transcript';

let transcript: Segment[] = [];

/** 1) Inject the interceptor as early as possible */
;(function injectInterceptor() {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('content/inject.js');
  s.onload = () => s.remove();
  (document.head || document.documentElement).appendChild(s);
})();

/** Utility: find the CC toggle button */
function getCCButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.ytp-subtitles-button');
}

/** Utility: set captions on or off */
function setCaptions(on: boolean) {
  const btn = getCCButton();
  if (!btn) return;
  const pressed = btn.getAttribute('aria-pressed') === 'true';
  if (pressed !== on) {
    btn.click();
    console.log(`🦆 Captions turned ${on ? 'ON' : 'OFF'}`);
  }
}

/** Utility: toggle off→on */
function retryCaptionsToggle() {
  setCaptions(false);
  setTimeout(() => setCaptions(true), 500);
  console.log('🦆 Retrying captions toggle (off→on)');
}

/** 2) When the video loads metadata, ensure CC is on */
;(function ensureCCOnLoad() {
  const poll = setInterval(() => {
    const video = document.querySelector<HTMLVideoElement>('video');
    if (video) {
      clearInterval(poll);
      video.addEventListener('loadedmetadata', () => {
        setCaptions(true);
      }, { once: true });
    }
  }, 500);
})();

/** 3) Listen for the intercepted timedtext calls */
window.addEventListener('YT_TIMEDTEXT', (ev: any) => {
  const { url, body } = ev.detail as { url: string; body: string };
  console.log('🦆 Intercepted timedtext call:', url);

  let segments: Segment[] = [];

  // Try JSON3
  if (body.trim().startsWith('{')) {
    try {
      const data = JSON.parse(body) as { events?: any[] };
      const evts = Array.isArray(data.events) ? data.events : [];
      segments = evts.map(e => ({
        start: (e.tStartMs ?? 0) / 1000,
        text:  (e.segs ?? []).map((s: any) => s.utf8).join('').trim()
      }));
    } catch (err) {
      console.error('❌ JSON3 parse failed:', err);
    }
  }

  // XML fallback
  if (segments.length === 0) {
    segments = Array.from(
      new DOMParser()
        .parseFromString(body, 'text/xml')
        .querySelectorAll('text')
    ).map(node => ({
      start: parseFloat(node.getAttribute('start') || '0'),
      text:  node.textContent?.replace(/\s+/g, ' ').trim() || ''
    }));
  }

  // If still zero, retry the toggle cycle
  if (segments.length === 0) {
    retryCaptionsToggle();
    return;
  }

  // Got real transcript: ensure captions on and store
  setCaptions(true);
  transcript = segments;
  console.log(`🦆 Transcript loaded: ${transcript.length} segments`);
});

/** 4) Respond to popup messages */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'getTranscript') {
    sendResponse({ transcript });
    return;
  }
  if (msg.action === 'seek' && typeof msg.time === 'number') {
    const t = msg.time;
    const video = document.querySelector<HTMLVideoElement>('video');
    if (video) {
      video.currentTime = t;
      return;
    }
    const yt = (window as any).YT?.get('movie_player');
    if (yt?.seekTo) {
      yt.seekTo(t, true);
    }
  }
});
