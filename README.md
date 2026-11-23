# SnapReply — AI Reply & Context-Aware Writing Companion

<p align="center">
  <img src="public/icons/icon.svg" width="96" height="96" alt="SnapReply Logo" />
</p>

<p align="center">
  <strong>Draft intelligent replies, rewrites, and summaries in seconds — right where you browse.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue.svg?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Framework-React%2018%20%2B%20TypeScript-61dafb.svg?style=flat-square" alt="React 18" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg?style=flat-square" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success.svg?style=flat-square" alt="Status" />
</p>

---

## ⚡ What is SnapReply?

**SnapReply** is a lightweight, context-aware writing companion designed for Chrome and Chromium-based browsers. It empowers you to understand incoming messages and craft natural, polished responses **without switching tabs** or copy-pasting back and forth into external AI chat interfaces.

### Core Workflow:
```text
Select Message ➔ Choose Intent / Tone ➔ Generate Draft ➔ Review & Edit ➔ 1-Click Insert or Copy
```

> **Safety Guarantee:** SnapReply **never auto-sends** messages or automatically triggers form submission. You always inspect, edit, and click Send yourself.

---

## ✨ Key Features

- 🟢 **Persistent Draggable Floating Icon with Red Selection Badge**:
  - A discreet obsidian circular widget with the iridescent Chromatic Orb floats on your screen whenever SnapReply is enabled.
  - **Freely Draggable Anywhere**: Drag and drop the icon to any corner or position across the screen; position is automatically remembered across page reloads.
  - **Dynamic Red Badge**: The instant you highlight any text on the webpage, a **vibrant red badge** (`✓` or `?`) illuminates on the floating orb.
  - **1-Click Rounded Modal**: Clicking the floating icon opens the luxury **rounded-shape popup modal** (`rounded-[28px]`), auto-detecting your selected text and answering questions immediately!
- ⚡ **Smart Question Auto-Detection & Instant Answering**:
  - Automatically identifies interrogative syntax (`?`, *how*, *what*, *why*, *can you*, *explain*, etc.).
  - Instantly drafts natural, human-crafted answers without requiring extra clicks or prompts.
- 📋 **Copy-to-Answer (Active Clipboard Interception)**:
  - Copy any question (`Ctrl+C` / `Cmd+C`) on any page — SnapReply immediately detects it and surfaces an animated Dynamic Island capsule ready to answer.
- 🔮 **Apple Intelligence Obsidian Aesthetic & Chromatic Orb**:
  - Ultra-luxury dark obsidian glass aesthetic inspired by Dynamic Island and Apple Intelligence.
  - Custom iridescent multi-color liquid ring orb with physics-based idle breathing and generation rotation.
  - Zero-scroll fixed architecture (410px × 525px) with staged presentation and no awkward clipping.
- 🎯 **Reply-First Experience**: Built specifically for communication workflows across Email (Gmail, Outlook), LinkedIn, Twitter/X, Slack, Reddit, forums, and customer support desks.
- 💬 **Multiple Actions in One Place**:
  - **Reply** (primary action) — context-aware reply matching your intent.
  - **Rewrite** — refine phrasing, cadence, and tone while preserving core meaning.
  - **Shorten** — condense verbose paragraphs into concise, punchy statements.
  - **Summarize** — extract bullet-point takeaways from long threads.
  - **Explain** — clarify complex or jargon-filled messages in plain English.
  - **Translate** — faithfully translate into 15+ global languages.
- 🎭 **7 Distinct Tone Presets**:
  - `Friendly` — warm, approachable, polite, and encouraging.
  - `Professional` — articulate, corporate-ready, and respectful.
  - `Casual` — relaxed, informal, peer-to-peer.
  - `Confident` — assertive, direct, and decisive.
  - `Empathetic` — compassionate, supportive, and thoughtful.
  - `Concise` — ultra-short, direct to the point with zero filler.
  - `Custom` — your own personal tone guidelines (e.g., "Like a tech founder").
- 📏 **Response Length Control**: Choose `Short` (1-2 punchy sentences), `Balanced` (1-2 paragraphs), or `Detailed` (comprehensive).
- 🛡️ **Zero Host Page Style Pollution**: The in-page floating bubble and overlay panel render inside a secure **Shadow DOM** (`#snapreply-host`), ensuring web pages can never break SnapReply's glassmorphic styling.
- ⚡ **Safe Text Insertion**: Intelligently inserts text into `<input>`, `<textarea>`, and rich `contenteditable` editors while preserving your undo/redo history. If insertion is unsupported or read-only, it automatically falls back to copying to your clipboard with friendly feedback.
- 🔑 **Multi-Provider AI Engine (BYOK + Demo Mode)**:
  - **NaraRouter (Bynara)**: High-speed, humanized AI routing via `https://router.bynara.id/v1/chat/completions` (model: `auto/bynara`).
  - **Built-in Demo Mode**: Instant, realistic, offline-capable responses out of the box with zero API key configuration!
  - **OpenAI**: Support for `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`.
  - **Google Gemini**: Support for `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`.
  - **Anthropic Claude**: Support for `claude-3-5-haiku` and `claude-3-5-sonnet`.
  - **Local AI / Custom**: Connect to local Ollama (`http://localhost:11434/v1`), LM Studio, or any OpenAI-compatible API proxy.
- 🔒 **Privacy-First Architecture**:
  - No background page scanning or browsing history tracking.
  - Text is captured **only** when you deliberately invoke an action or copy/select text.
  - API keys and history live exclusively in local browser storage (`chrome.storage.local`).
  - Clear all local data with a single click.

---

## 🚀 Quick Start & Installation

### Option 1: Load as Unpacked Extension in Chrome

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/snapreply.git
   cd snap-reply
   ```

2. Install dependencies and build the extension:
   ```bash
   npm install
   npm run build
   ```
   *This compiles the extension into the `dist/` directory.*

3. Open Google Chrome (or Edge, Brave, Arc, Opera) and navigate to:
   ```text
   chrome://extensions
   ```

4. Enable **Developer mode** using the toggle switch in the top-right corner.

5. Click **"Load unpacked"** in the top-left toolbar.

6. Select the `dist/` folder located inside the `snap-reply` project directory.

7. **Done!** The SnapReply icon will appear in your Chrome extensions bar. Pin it for quick access!

---

## 💡 How to Use SnapReply

### 1. In-Page Floating Quick Action
1. Highlight any text or incoming message on any webpage.
2. A subtle floating **Reply** bubble will appear near your selection.
3. Click it to instantly open the **SnapReply Overlay Card**.
4. Choose your tone, optionally type an intent (e.g., *"Accept, but ask for the deck"*), and click **Generate Draft**.
5. Click **Insert in Page** to paste it directly into your active response field, or click **Copy**!

### 2. Right-Click Context Menu
1. Select text anywhere on the web.
2. Right-click and choose **SnapReply** ➔ **Reply to selected message** (or *Rewrite*, *Summarize*, *Explain*).
3. The floating card opens immediately with your selection pre-loaded.

### 3. Keyboard Shortcut
- **Alt + Shift + R** (Mac: `Ctrl + Shift + R`) — Instantly invokes SnapReply on currently highlighted text.
- **Alt + Shift + P** (Mac: `Ctrl + Shift + P`) — Opens the SnapReply toolbar popup.

### 4. Toolbar Popup Composer
- Click the SnapReply icon in your Chrome toolbar.
- If you highlighted text before clicking, it will be automatically populated!
- Alternatively, paste or type any context manually into the text area.
- Access your recent local generation history via the history drawer button.

---

## ⚙️ Configuration & Settings

Click the Settings Gear icon in the popup or right-click the extension icon and select **Options**:

1. **AI Provider Tab**:
   - Switch between **Built-in Demo Mode**, **OpenAI**, **Google Gemini**, **Anthropic Claude**, or **Local AI (Ollama)**.
   - Enter your API Key and click **"Test Connection"** to verify API connectivity with live ping feedback.
2. **Writing Preferences Tab**:
   - Set your preferred default tone, response length, and default language.
   - Toggle the floating quick action bubble on or off.
   - Toggle auto-copy to clipboard.
3. **Privacy & Data Tab**:
   - View explicit data governance disclosures.
   - Enable or disable local draft history.
   - One-click **Clear All Local Data & API Keys**.
4. **Live Test Playground**:
   - Try prompt variations and tone testing right in the options page before using on external sites.

---

## 🛠️ Project Structure

```text
snap-reply/
├── dist/                      # Compiled production Chrome extension
├── public/
│   ├── icons/                 # Crisp brand icons (16, 32, 48, 128px & SVG)
│   └── manifest.json          # Manifest V3 configuration
├── src/
│   ├── background/
│   │   └── service-worker.ts  # MV3 service worker, context menus & commands
│   ├── content/
│   │   ├── content.ts         # In-page orchestrator & Shadow DOM injector
│   │   ├── content.css        # Scoped Tailwind CSS for Shadow DOM
│   │   ├── selection.ts       # Text selection & coordinate capture
│   │   ├── editable-detection.ts # Input, textarea & contenteditable detector
│   │   ├── insertion.ts       # Safe text insertion engine & clipboard fallback
│   │   └── overlay/
│   │       ├── QuickActionBubble.tsx # Floating pill launcher
│   │       └── OverlayView.tsx       # Draggable glassmorphic card
│   ├── popup/
│   │   ├── index.html         # Toolbar popup shell
│   │   └── Popup.tsx          # Popup UI, manual composer & history drawer
│   ├── options/
│   │   ├── index.html         # Settings page shell
│   │   └── Options.tsx        # Settings tabs, provider setup & playground
│   ├── onboarding/
│   │   ├── index.html         # First-install welcome shell
│   │   └── Onboarding.tsx     # 4-step interactive onboarding tour
│   ├── shared/
│   │   ├── types/             # TypeScript definitions & messaging protocols
│   │   ├── storage/           # Chrome storage local wrappers & listeners
│   │   ├── prompts/           # Prompt engine & prompt injection defenses
│   │   ├── providers/         # Mock, OpenAI, Gemini, Claude & Custom adapters
│   │   └── utils/             # Clipboard helpers & formatters
│   └── styles/
│       └── globals.css        # Shared Tailwind design system
├── scripts/
│   ├── build.js               # Multi-target Vite & PostCSS build script
│   └── generate-icons.js      # Pure Node.js PNG icon rasterizer
├── docs/
│   ├── USER_GUIDE.md          # Comprehensive user manual
│   ├── ARCHITECTURE.md        # Technical architecture & design
│   ├── PRIVACY.md             # Privacy policy & data governance
│   └── RELEASE_CHECKLIST.md   # Chrome Web Store submission checklist
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🔒 Privacy & Permissions

SnapReply requests the bare minimum permissions necessary under Chrome Manifest V3:

| Permission | Purpose |
|---|---|
| `storage` | Store your settings, provider choices, API keys, and local history safely in your browser. |
| `contextMenus` | Add right-click actions ("Reply with SnapReply", "Rewrite", "Summarize", etc.). |
| `activeTab` | Access selected text and insert drafted replies into the focused field only when you trigger an action. |
| `clipboardWrite` | Allow 1-click copying of generated drafts to your system clipboard. |

**No data is ever sold, tracked, or sent to analytics servers.** When you use your own API keys, requests travel directly between your browser and your chosen AI provider.

---

## 📖 Complete Documentation

- 📘 [Full User Guide](docs/USER_GUIDE.md) — Step-by-step walkthrough for all features and troubleshooting.
- 🏗️ [Technical Architecture](docs/ARCHITECTURE.md) — System design, message routing, and security.
- 🛡️ [Privacy Policy & Data Disclosure](docs/PRIVACY.md) — Data inventory and local storage policy.
- 📋 [Release Checklist](docs/RELEASE_CHECKLIST.md) — Chrome Web Store readiness guide.

---

## 📜 License

Released under the [MIT License](LICENSE). Built with precision and care.
