### Podcast Studio Release Notes 🎙️

## Version 1.0 (December 2025)

### 🎉 Major Release - Full-Featured Podcast Production Studio

#### ✨ Core Features

**AI-Powered Script Creation**
- **Write with AI:** Generate complete podcast scripts from simple prompts using Gemini 3.8 Flash, Gemini 3.1 Pro, Gemini 3.5 Flash Lite, Gemini 2.5 Flash, or Gemini 2.5 Pro
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
- **TTS Models:** Choose between Gemini 3.8 Flash TTS (Fast & Expressive), Gemini 3.8 Flash-Lite TTS (Lightweight), Gemini 2.5 Pro TTS (High Quality), or Gemini 2.5 Flash TTS (Faster)
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

