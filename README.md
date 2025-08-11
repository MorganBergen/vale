Vale — speak Codex responses and log chats
=================================================

What this does
- Read aloud Codex CLI outputs using a British female voice.
- Append every conversation to `docs/history/chats/00-chat.md` for later review.

Quick start
- Requirements: Node.js 18+, macOS/Linux/Windows with system TTS available.
- Install locally (symlink): `npm link` in this repo, then run `vale`.

Usage
- Wrap an existing Codex CLI invocation (no voice input involved):
  - `vale wrap -- chat "Explain event loop in Node.js"`
  - Everything printed to your terminal is also written to `docs/history/chats/00-chat.md` and read aloud.
- Direct chat via OpenAI API (optional):
  - Set `OPENAI_API_KEY`, then `vale chat "Summarize SOLID principles"`.

Options
- `--file, -f`: Change log file path (default `docs/history/chats/00-chat.md`).
- `--voice, -v`: Change voice (default `Kate` on macOS; try `Serena`).
- `--provider, -p`: `system` (default) or `openai` to use OpenAI TTS (voice `vale`).

Notes
- To use OpenAI TTS, set `OPENAI_API_KEY` and optionally `OPENAI_TTS_MODEL=gpt-4o-mini-tts`.
- On macOS, `say -v Kate` provides a UK female voice. If you prefer OpenAI’s `vale`, set `--provider openai -v vale`.
- The wrapper writes raw terminal output to the log and removes code blocks when speaking to avoid reading code aloud.
