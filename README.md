# YouTube Keyword Jump

A Chrome extension that lets you search for any spoken keyword in a YouTube video and jump instantly to exactly where that word is spoken.

---

## Features

- **Automatic transcript interception**  
  Wraps YouTube’s own `/api/timedtext` calls (both JSON3 and XML) in the page context and parses out every caption segment (`{ start: number, text: string }`).

- **Instant keyword search UI**  
  Popup UI built with React + TypeScript. Type a word, press **Enter** or click **Go**, and see every matching timestamp + snippet.

- **One-click seeking**  
  Click any result to have the video’s playback jump straight to that timestamp.

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- Chrome browser (any recent version)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/yt-keyword-jump.git
cd yt-keyword-jump
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the extension

This will compile the TypeScript, bundle your React popup, copy static assets, and output everything into the `dist/` folder:

```bash
npm run build
```

### 4. Load into Chrome

1. Open `chrome://extensions` in Chrome.  
2. Enable **Developer mode** (toggle in the top right).  
3. Click **Load unpacked** and select the `dist/` directory.  
4. You should now see **YouTube Keyword Jump** in your extensions list.

---

## Usage

1. Navigate to any YouTube video that has captions (automatic or uploaded).  
2. Click the **YouTube Keyword Jump** icon in the toolbar.  
3. In the popup:
   - Type the word you want to find.
   - Press **Enter** or click **Go**.
4. Browse the list of matching timestamps and snippets.  
5. Click any result to jump the video directly to that moment (and the popup will close automatically).

---

## Development Mode

If you’d like live-reload during development:

1. Run the Vite dev server:

   ```bash
   npm run dev
   ```

2. In `chrome://extensions` load the **unpacked** `dist/` folder as above.  
3. Vite will rebuild on file changes—just **Reload** the extension in Chrome to pick up your latest code.

*(Note: full HMR in Chrome popups requires additional plugin setup; for quick iteration, a manual reload is simplest.)*

---

## Customizing the Icon

To use your own extension icon:

1. Place your `16×16`, `48×48`, and `128×128` PNG/SVG files in `public/icons/`.  
2. Update `public/manifest.json` under the `"icons"` and `"action.default_icon"` keys to point to your new files.  
3. Rebuild (`npm run build`) and Reload the extension.

---

## License

MIT © [Your Name or Organization]  
Feel free to fork, modify, and redistribute!
