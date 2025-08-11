import fs from 'fs';
import { dirname } from 'path';

export function ensureLogDir(filePath) {
  const dir = dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function appendSessionLog(filePath, title, stdoutText, stderrText) {
  const lines = [];
  lines.push(`\n## ${title}`);
  if (stderrText && stderrText.trim()) {
    lines.push('\n<details><summary>stderr</summary>');
    lines.push('\n```');
    lines.push(stderrText.trimEnd());
    lines.push('```');
    lines.push('</details>');
  }
  if (stdoutText && stdoutText.trim()) {
    lines.push('\n```');
    lines.push(stdoutText.trimEnd());
    lines.push('```');
  }
  lines.push('');

  await fs.promises.appendFile(filePath, lines.join('\n'), 'utf8');
}

