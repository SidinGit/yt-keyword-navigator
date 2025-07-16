// src/background/background.ts
// Background service worker for extension lifecycle events
console.log('🦆 background worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('🦆 YouTube Keyword Jump extension installed or updated');
});

// You can add alarms or message listeners here for future features