export function stripAnsi(str) {
  // Basic ANSI escape sequences removal
  return str.replaceAll(/\u001b\[[0-9;]*m/g, '');
}

export function stripCodeBlocks(str) {
  // Remove fenced code blocks and inline code for TTS friendliness
  let out = str.replaceAll(/```[\s\S]*?```/g, '');
  out = out.replaceAll(/`[^`]*`/g, '');
  return out;
}

export function collapseWhitespace(str) {
  return str.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
}

export function cleanForSpeech(str) {
  return collapseWhitespace(stripCodeBlocks(stripAnsi(str))).trim();
}

export function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

