# Podcast Studio 🎙️

Welcome to Podcast Studio, a self-contained web-based application that leverages Google's Gemini API to transform text scripts into high-quality, multi-speaker audio productions. Create engaging podcast-style conversations with ease, powered by cutting-edge AI for both script creation and audio generation.

<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio and Antigravity</h2>

  <a href="https://ai.studio/apps/drive/1etRpxkEesgJEQ1h75CYtxplnWHuMEpsq?fullscreenApplet=true">Open and use with Google AI Studio (Free development tier)</a>
  <p>v1.2 Full-Stack Release — Seamless multi-speaker podcast generation powered by Gemini</p>
</div>

---

<div align="center">
💖 If you find this helps you
</br></br>
<a href="https://buymeacoffee.com/rdeangel" target="_blank" 
title="Support InstradaOGM Development">
  <img src="buy_me_a_coffee.png" alt="Buy Me a Coffee" width="130">
</a>
</div>

---

## 🎧 Audio Samples

Listen to these examples generated completely by Podcast Studio:

- 🇺🇸 **English Sample:**
<br>[![Play](https://img.shields.io/badge/Play_Audio-100000?style=for-the-badge&logo=youtube&logoColor=white)](https://github.com/user-attachments/files/23892319/podcast_the_ai_behind_the_mic__exploring_podcast_studio.mp3)</br>
- 🇮🇹 **Italian Sample:**
<br>[![Play](https://img.shields.io/badge/Play_Audio-100000?style=for-the-badge&logo=youtube&logoColor=white)](https://github.com/user-attachments/files/23892377/podcast_l_ia_dietro_il_microfono__esplorando_podcast_studio.mp3)</br>


## ✨ Key Features

- **AI Script Writing & Enhancement:**
    - **✍️ Write with AI:** Generate a complete podcast script from a simple prompt using models like **Gemini 3.8 Flash**, **Gemini 3.1 Pro**, **Gemini 3.5 Flash Lite**, **Gemini 2.5 Flash**, or **Gemini 2.5 Pro**.
    - **📖 Podcastify:** Convert any block of text (like an article or notes) into a conversational script.
    - **🌐 Translate Script:** Instantly translate your script into over 80 languages while preserving speaker assignments and formatting.
    - **✨ Improve Script:** Automatically enhance the clarity, flow, and engagement of your existing script.
    - **📏 Increase Duration:** Rewrite the script to meet a longer target duration.
    - **💬 Add Exchanges:** Lengthen the dialogue by adding more back-and-forth turns between speakers.
    - **🎭 Add Expressions:** Inject natural-sounding emotional cues (e.g., `(laughing)`, `(thoughtfully)`) into the script.
- **Multi-Speaker Support:** Configure up to **10 unique speakers**, each with a customizable name and voice. The application automatically parses scripts formatted with `Speaker #: ...`.
- **Extensive Voice Library:** Choose from a wide selection of high-quality, pre-built voices to give each speaker a distinct personality. You can preview each voice before selecting it.
- **Massive Multi-Language Support:** The UI and AI generation can be switched between **over 80 languages and regional dialects** for a truly global and localized experience.
- **Flexible Audio Generation:**
    - **TTS Models:** Choose between **Gemini 3.8 Flash TTS** (State-of-the-Art, Fast & Expressive), **Gemini 3.8 Flash-Lite TTS** (Lightweight), **Gemini 2.5 Pro TTS** (High Quality), or **Gemini 2.5 Flash TTS** (Faster).
    - **Processing Modes:**
        - **Line-by-Line:** The most robust method, processing each line individually. Ideal for podcasts with up to 10 speakers.
        - **Multi-Speaker:** A faster mode that processes the entire script in one go for natural pacing (strictly limited to 2 speakers).
- **Multiple Audio Formats:** Export your final podcast in either compressed **MP3** for easy sharing or uncompressed **WAV** for high-fidelity audio.
- **Script Export Options:**
    - **📝 Raw Text (.txt):** Download the exact content from the script editor.
    - **📄 Markdown (.md):** Export a beautifully formatted version with a title, speaker list, and bolded speaker names for easy reading.

## 💾 Browser Storage & Persistence

Podcast Studio automatically remembers your preferences using browser localStorage, making your workflow seamless across sessions:

- **⚙️ Settings Persistence:**
    - Language selection (UI language)
    - Processing mode (Line-by-Line or Multi-Speaker)
    - TTS Model preference
    - Gemini Model selection
    - Script length setting
    - Podcastify length setting
    - Target language for translation
- **🎤 Voice Configuration:**
    - Selected voices for each speaker are remembered
    - Speaker count is preserved
    - Voice names automatically update based on the current language (friendly names are not stored, only voice IDs)
- **🔐 Privacy:**
    - API keys are **never** stored in localStorage for security reasons
    - All stored data remains local to your browser

## ⌨️ Keyboard Shortcuts

Enhance your productivity with these keyboard shortcuts:

- **Arrow Up/Down** - Navigate through language options when the dropdown is open
- **Enter** - Select the highlighted language
- **Escape** - Close the language dropdown

## 🌍 Supported Languages

Podcast Studio shuold supports the following languages for both the User Interface and AI Generation (only a few were tested):

<details>
<summary>Click to view full list (80+)</summary>

| | | |
|:---|:---|:---|
| Afrikaans | Albanian (Shqip) | Arabic (العربية) |
| Armenian (Հայերեն) | Azerbaijani (Azərbaycanca) | Basque (Euskara) |
| Bengali (বাংলা) | Bulgarian (български) | Burmese (မြန်မာ) |
| Catalan (Català) | Chinese (Simplified) | Chinese (Traditional) |
| Croatian (Hrvatski) | Czech (Čeština) | Danish (Dansk) |
| Dutch (Nederlands) | English (Australia) | English (Canada) |
| English (India) | English (UK) | English (US) |
| Estonian (Eesti) | Filipino | Finnish (Suomi) |
| French (Français) | Galician (Galego) | Georgian (ქართული) |
| German (Deutsch) | Greek (Ελληνικά) | Gujarati (ગુજરાતી) |
| Hebrew (עברית) | Hindi (हिन्दी) | Hungarian (Magyar) |
| Icelandic (Íslenska) | Indonesian (Bahasa Indonesia) | Irish (Gaeilge) |
| Italian (Italiano) | Japanese (日本語) | Kannada (ಕನ್ನಡ) |
| Kazakh (Қазақ) | Khmer (ខ្មែរ) | Korean (한국어) |
| Lao (ລາວ) | Latvian (Latviešu) | Lithuanian (Lietuvių) |
| Macedonian (Македонски) | Malay (Bahasa Melayu) | Malayalam (മലയാളം) |
| Marathi (मराठी) | Nepali (नेपाली) | Norwegian (Norsk) |
| Persian (فارسی) | Polish (Polski) | Portuguese (Brazil) |
| Portuguese (Portugal) | Romanian (Română) | Russian (Русский) |
| Serbian (Српски) | Sinhala (සිංහල) | Slovak (Slovenčina) |
| Slovenian (Slovenščina) | Spanish (Español) | Swahili (Kiswahili) |
| Swedish (Svenska) | Tamil (தமிழ்) | Telugu (తెలుగు) |
| Thai (ไทย) | Turkish (Türkçe) | Ukrainian (Українська) |
| Urdu (اردو) | Uzbek (O'zbekcha) | Vietnamese (Tiếng Việt) |
| Welsh (Cymraeg) | | |

</details>

## 🚀 How to Use

1.  **Configure Speakers (Important First Step):**
    - Use the **+ Add Speaker** button to add your desired number of speakers (up to 10).
    - For each speaker, assign a name and select a unique voice from the dropdown menu. You can preview any voice by clicking the ▶️ play button.
    - **Pro Tip:** It's highly recommended to set up your speakers *before* generating a script. The AI uses the speaker names and voice profiles as context when writing dialogue.

2.  **Write, Generate, or Translate a Script:**
    - **Write:** Type your script manually in the format `Speaker 1: Hello...`, `Speaker 2: Hi there...`.
    - **Generate:** Use **Write with AI** or **Podcastify** to create content from scratch.
    - **Translate:** Use the **Translate** feature to localize an existing script to a new language, automatically updating speaker instructions for the AI.

3.  **Choose Your Options:**
    - **Processing Mode:** Defaults to "Multi-Speaker" for 2 speakers (faster) or "Line-by-Line" for 3+ speakers (more robust).
    - **TTS Model:** Select **Gemini 3.8 Flash TTS** (Expressive & Fast, default), **Gemini 3.8 Flash-Lite TTS**, **Gemini 2.5 Pro TTS**, or **Gemini 2.5 Flash TTS**.
    - **Audio Format:** MP3 or WAV.

4.  **Create Your Podcast:**
    - Click the **Create Podcast** button.
    - The application will show a progress bar.
    - Once complete, an audio player will appear to listen to the result.

5.  **Save & Share:**
    - Use the **Save/Share** button to download the generated audio file.

## 🔐 Server-Side Architecture & Authentication

Starting with **v1.2**, Podcast Studio runs on a robust full-stack architecture:

-   **Zero Client Credentials:** No manual API key input is needed in the browser UI. Anyone accessing the app can immediately generate scripts and audio without setup.
-   **Official `@google/genai` Backend:** All Gemini model interactions are proxied through an Express backend (`server.ts`) using the official `@google/genai` SDK.
-   **High-Performance Streaming:** Script writing and podcastifying support real-time Server-Sent Events (SSE) streaming directly from Gemini.
-   **Gemini Live API Support:** Bidirectional WebSocket proxy on `/live` enabling interactive voice sessions with `gemini-3.8-live`.

## 🛠️ Technical Details

-   **Backend:** Node.js, Express 5, `@google/genai` SDK, WebSockets (`ws`).
-   **Frontend:** Vanilla TypeScript/JavaScript, HTML5, Tailwind CSS, Vite.
-   **AI Script Generation:** Powered by **Gemini 3.8 Flash**, **Gemini 3.1 Pro**, **Gemini 3.5 Flash Lite**, **Gemini 2.5 Flash**, and **Gemini 2.5 Pro**.
-   **Audio Generation:** Powered by **Gemini 3.8 Flash TTS**, **Gemini 3.8 Flash-Lite TTS**, **Gemini 2.5 Pro TTS**, and **Gemini 2.5 Flash TTS**.
-   **Audio Processing:** Container-safe RIFF/WAVE header demuxing, seamless 15ms boundary crossfades, natural 250ms conversational speaker pauses, client-side MP3 encoding via `lamejs`, and native WAV export.

## 📁 File Structure

-   `server.ts`: Express backend proxying Gemini API requests, SSE streaming, and Live API WebSockets.
-   `index.html`: The main user interface and client layout.
-   `index.tsx`: Client-side application logic, UI interaction, audio assembly, and API communication.
-   `metadata.json`: Project configuration for AI Studio.
-   `README.md`: Documentation and guide.
-   `RELEASE_NOTES.md`: Comprehensive version history and changelog.
-   `package.json`: Project dependencies and scripts.
-   `vite.config.ts`: Vite build and development configuration.
-   `tsconfig.json`: TypeScript compiler configuration.
-   `.gitignore`: Git ignore rules.




