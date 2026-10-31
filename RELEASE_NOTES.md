### Podcast Studio Release Notes 🎙️

## Version 1.4 (October 2026)

### ⏱️ Configurable Request Timeout & Resilience

#### ✨ What's New & Changed in v1.4

**Configurable Request Timeout (30s – 300s)**
- **Solve "This operation was aborted":** Long dialogues, rich expressions, or multi-speaker synthesis with Gemini 3.8 Flash TTS often require over 60 seconds of processing time.
- **Interactive UI Control:** Added a dedicated **Request Timeout** dropdown selector in the primary settings bar with presets from 30s up to 300s (5 minutes), defaulting to 120s.
- **End-to-End Propagation:** Configured timeouts are automatically persisted in `localStorage` (`podcast_settings_timeout_seconds`), passed via `x-timeout-seconds` / request body to the backend proxy client, and applied to direct browser calls.
- **Server Environment Variable Support:** Server hosts can also set `GEMINI_TIMEOUT_SECONDS` (e.g. `GEMINI_TIMEOUT_SECONDS=180`) to customize system-wide defaults.
- **Actionable Timeout Recovery:** Distinguishes explicit user cancellation from network/server timeouts, with actionable one-click suggestions to increase the Request Timeout setting or switch to Line-by-Line mode.

---

## Version 1.3 (October 2026)

### 🌐 Hybrid Execution & Custom Paid Gemini API Key Support

#### ✨ What's New & Changed in v1.3

**Universal Custom / Paid Gemini API Key Option**
- **Bypass Free-Tier Quotas & High Demand:** You can now enter your own paid or personal Google Gemini API key directly within the app—even when running inside AI Studio or Cloud Run.
- **Header & Body Forwarding:** When a custom API key is supplied, client requests forward the key via the `x-gemini-api-key` header to the backend proxy, overriding the shared server key and routing requests directly to your personal quota.
- **Dynamic Badge Status:** The UI displays a live status badge:
  - 🟢 `AI Studio Ready (Free Tier)`: Zero-config operation using shared development credentials.
  - 🟡 `Using Custom Paid Key (Active)`: Using your personal key for high-throughput generation and Pro models.
  - 🔵 `Standalone Mode (Key Required)`: When running directly from a local browser file without a server.
- **Convenient Key Management:** Includes real-time Show/Hide toggle, Clear button, and secure tab-isolated `sessionStorage` caching (never persisted to permanent storage).

**Resilient Response Handling & JSON Parsing Fix**
- **Eliminated `JSON.parse` Crash:** Fixed an issue where upstream rate-limit (429) or high-demand (503) errors returned HTML error pages from reverse proxies, triggering `Script generation failed: JSON.parse: unexpected character at line 1 column 1`.
- **Safe JSON Parsing:** Added `safeParseJsonResponse` on the client and standardized server error payloads with actionable contextual suggestions (e.g. recommending Gemini 3.5 Flash or entering a paid key).

**Updated Gemini Model Suite**
- **Default to Gemini 3.5 Flash:** Set **Gemini 3.5 Flash** and **Gemini 3.5 Flash Lite** as default script generation models for instant, dependable generation without 503 load spikes.
- **Deprecated Legacy 2.5 Models:** Retired `gemini-2.5-flash` and `gemini-2.5-pro` (which returned 404 "no longer available to new users"). Legacy requests are transparently mapped to Gemini 3.5 Flash and Gemini 3.1 Pro.
- **Pro & Reasoning Guidance:** Clearly labeled **Gemini 3.8 Flash** (best with personal paid key during peak hours) and **Gemini 3.1 Pro** (requires billing/paid key).

**Standalone Direct Browser Mode (`file://`)**
- **Zero-Dependency Local Execution:** You can download `index.html` and open it directly in any browser without needing to run a backend server or install npm dependencies.
- **Smart Runtime Environment Auto-Detection:** Automatically tests for `/api/health` at startup to determine whether to route requests through the server proxy or call Google's Generative Language API directly.

---

## Version 1.2 (October 2026)

### 🛡️ Full-Stack Server-Side Architecture & Deployment Hardening

#### ✨ What's New & Changed in v1.2

**Server-Side Gemini API Proxy Architecture**
- **Zero Client-Side Credentials:** Migrated all Gemini API communications to a dedicated backend server (`server.ts`) powered by the official `@google/genai` SDK.
- **Unified Proxy Endpoints:** Added `/api/gemini/generate` for text generation and `/api/gemini/tts` for both single-speaker and multi-speaker speech synthesis.
- **Server-Sent Events (SSE) Streaming:** Added real-time text streaming support via Server-Sent Events.
- **Gemini Live API WebSocket Support:** Added real-time bidirectional WebSocket transport on `/live` and `/api/live` connecting to `gemini-3.8-live`.
- **Frictionless Experience:** Removed manual API key input fields in the user interface for hosted deployments—the app authenticates automatically for everyone who opens it.

**Cloud Run Production & Dev Runtime Hardening**
- **Node 22 ESM Type-Stripping:** Converted server type imports to `import type` to support clean native execution on modern Node.js versions without runtime transpile overhead.
- **Express 5 Wildcard Routing Support:** Upgraded SPA fallback middleware to support Express 5 without path-to-regexp syntax errors.
- **Vite Middleware & HMR Integration:** Bound Vite's development HMR directly to the parent HTTP server instance, preventing port 24678 fallback collisions.
- **Iframe WebSocket Noise Suppression:** Added client-side error filtering to ignore harmless Vite development WebSocket disconnects in iframe preview environments.

---

## Version 1.1 (October 2026)

### 🚀 Gemini 3.x Models & Audio Processing Enhancements

#### ✨ What's New & Changed in v1.1

**Gemini 3.x Script Generation Models**
- **Expanded Model Suite:** Added support for **Gemini 3.8 Flash**, **Gemini 3.1 Pro**, and **Gemini 3.5 Flash Lite** for both "Write with AI" and "Podcastify" tools.
- **Model Sunset:** Dropped legacy Gemini 3.0 Pro preview option in favor of newer 3.x models.

**Next-Gen Gemini TTS Integration**
- **New TTS Models:** Added **Gemini 3.8 Flash TTS** (Fast & Expressive, default) and **Gemini 3.8 Flash-Lite TTS** (Lightweight) alongside Gemini 2.5 Pro and Gemini 2.5 Flash TTS.
- **Multi-Speaker Speech Metadata:** Restructured multi-speaker TTS request payloads to pass individual dialogue lines with speech metadata (`speakerTurnConfig`), ensuring full compatibility with newer Gemini TTS models.

**Audio Quality & Pacing Improvements**
- **RIFF/WAVE Header Demuxing:** Implemented RIFF/WAVE container header detection and parsing to strip container bytes prior to PCM decoding, completely eliminating audible static bursts and loud noise artifacts caused by raw decoding of WAV container headers.
- **Click & Pop Elimination:** Applied a 15ms fade-in and fade-out smoothing to audio chunk boundaries to avoid zero-crossing impulse clicks.
- **Natural Conversational Pauses:** Added a 250ms natural pause of silence between speaker turns for a realistic back-and-forth dialogue rhythm.

**Error Handling & Diagnostics**
- **Detailed API Error Reporting:** Server error responses now extract and display detailed JSON error messages and error bodies instead of generic HTTP status codes.

---

## Version 1.0 (December 2025)

### 🎉 Major Release - Full-Featured Podcast Production Studio

#### ✨ Core Features

**AI-Powered Script Creation**
- **Write with AI:** Generate complete podcast scripts from simple prompts using Gemini 2.5 Flash, Gemini 2.5 Pro, or Gemini 3.0 Pro
- **Podcastify:** Transform any text (articles, notes, documents) into engaging conversational scripts
- **Script Translation:** Translate scripts into 80+ languages while preserving speaker formatting and automatically updating speaker instructions
- **Improve Script:** Enhance clarity, flow, and engagement automatically
- **Increase Duration:** Extend scripts to meet longer target durations
- **Add Exchanges:** Create more back-and-forth dialogue between speakers
- **Add Expressions:** Inject natural emotional cues like `(laughing)` or `(thoughtfully)`

**Multi-Speaker Support**
- Configure up to 10 unique speakers with customizable names and voices
- Extensive voice library with preview capability
- Automatic script parsing for `Speaker #: ...` format
- Voice randomization with duplicate prevention

**Audio Generation**
- **TTS Models:** Choose between Gemini 2.5 Pro (High Quality) or Gemini 2.5 Flash (Faster)
- **Processing Modes:**
  - Line-by-Line: Robust mode supporting up to 10 speakers
  - Multi-Speaker: Faster mode for 2-speaker dialogues with natural pacing
- Smart automatic mode selection based on speaker count
- MP3 and WAV export formats

**Internationalization**
- 80+ languages and regional dialects supported
- Complete UI localization
- AI generation in user's selected language
- Searchable language dropdown with instant filtering

#### 💾 Browser Storage & Persistence

**Settings Persistence:**
- Language selection (UI language)
- Processing mode preference
- TTS Model selection
- Gemini Model selection
- Script length configuration
- Podcastify length settings
- Target translation language

**Voice Configuration:**
- Selected voices for each speaker are remembered across sessions
- Speaker count is preserved
- Voice names automatically update based on current language
- Only voice IDs are stored (friendly names adapt to language)

**Privacy & Security:**
- API keys are never stored in localStorage
- All data remains local to your browser

#### ⌨️ Keyboard Shortcuts & Navigation

**Enhanced Productivity:**
- **Arrow Up/Down:** Navigate through language options in dropdown
- **Enter:** Select highlighted language
- **Escape:** Close language dropdown
- Searchable language selector with instant filtering
- Smooth keyboard navigation throughout the interface

#### 📤 Export Options

**Script Export:**
- **Raw Text (.txt):** Export exact script content
- **Markdown (.md):** Formatted export with title, speaker list, and bolded speaker names

**Audio Export:**
- **MP3:** Compressed format for easy sharing
- **WAV:** Uncompressed high-fidelity audio

#### 🛠️ Technical Improvements

- Single-file architecture (no server required)
- All language data embedded for offline capability
- Client-side MP3 encoding via lamejs
- Native WAV construction
- Optimized processing with progress tracking
- Smart error handling and user feedback

---

### Known Limitations

- Multi-Speaker mode limited to 2 speakers for optimal quality
- Some languages have limited testing (80+ languages supported, core languages fully tested)
- API key required for standalone usage (not needed in AI Studio)
