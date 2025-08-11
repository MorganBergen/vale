import { spawn } from 'child_process';
import os from 'os';

export async function speak(text, { provider = 'system', voice = 'Kate' } = {}) {
  if (!text || !text.trim()) return;
  if (provider === 'openai') {
    try {
      await speakOpenAI(text, voice);
      return;
    } catch (e) {
      // Fallback to system if OpenAI fails
      // eslint-disable-next-line no-console
      console.error('OpenAI TTS failed, falling back to system:', e.message);
    }
  }
  await speakSystem(text, voice);
}

async function speakSystem(text, voice) {
  const platform = os.platform();
  if (platform === 'darwin') {
    // macOS `say`
    await runCommand('say', ['-v', voice, text]);
    return;
  }
  if (platform === 'win32') {
    const psScript = `Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Rate = 0; $speak.SelectVoice('${voice}'); $speak.Speak([Console]::In.ReadToEnd())`;
    await runCommand('powershell', ['-NoProfile', '-Command', psScript], text);
    return;
  }
  // Linux: try espeak
  try {
    await runCommand('espeak', [text]);
  } catch (_) {
    // As last resort, do nothing
  }
}

async function speakOpenAI(text, voice) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
  const format = 'mp3';

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      voice: voice || 'vale',
      input: text,
      format
    })
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`OpenAI TTS HTTP ${res.status}: ${t}`);
  }
  const buf = new Uint8Array(await res.arrayBuffer());

  // Play audio
  const platform = os.platform();
  if (platform === 'darwin') {
    await playAudio(buf, 'afplay');
  } else if (platform === 'linux') {
    // try mpg123
    await playAudio(buf, 'mpg123');
  } else if (platform === 'win32') {
    // Windows: write temp file and use powershell to play via Windows.Media
    await playAudioWindows(buf);
  }
}

function runCommand(cmd, args, stdinText) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['pipe', 'ignore', 'inherit'] });
    if (stdinText) {
      child.stdin.write(stdinText);
    }
    child.stdin.end();
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function playAudio(buf, playerCmd) {
  // Write to temp file then play
  const { mkdtempSync, writeFileSync } = await import('fs');
  const { tmpdir } = await import('os');
  const { join } = await import('path');
  const dir = mkdtempSync(join(tmpdir(), 'vale-'));
  const file = join(dir, 'speech.mp3');
  writeFileSync(file, buf);
  await runCommand(playerCmd, [file]);
}

async function playAudioWindows(buf) {
  const { mkdtempSync, writeFileSync } = await import('fs');
  const { tmpdir } = await import('os');
  const { join } = await import('path');
  const dir = mkdtempSync(join(tmpdir(), 'vale-'));
  const file = join(dir, 'speech.mp3');
  writeFileSync(file, buf);
  const ps = `Add-Type -AssemblyName presentationCore; $m = New-Object System.Windows.Media.MediaPlayer; $m.Open([uri]'${file.replace(/\\/g, '/') }'); $m.Play(); Start-Sleep -Milliseconds 500; while($m.Position -lt $m.NaturalDuration.TimeSpan){ Start-Sleep -Milliseconds 200 }`;
  await runCommand('powershell', ['-NoProfile', '-Command', ps]);
}

