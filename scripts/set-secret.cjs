// Saves keys into .env.local without showing them on screen or leaving a copy anywhere else.
// Usage: node scripts/set-secret.cjs LABEL [LABEL...]
/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env.local');

// What each value should look like, so a wrong paste is caught straight away.
const FORMATS = {
  RESEND_API_KEY: { re: /^re_(?!.*re_)[A-Za-z0-9_-]+$/, hint: 'one full key starting re_, pasted once, with no dots or stars' },
  ANTHROPIC_API_KEY: { re: /^sk-ant-(?!.*sk-ant-)[A-Za-z0-9_-]+$/, hint: 'one full key starting sk-ant-, pasted once, with no dots or stars' },
  DEMO_INBOX_EMAIL: { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, hint: 'an email address', visible: true },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: { re: /^pk_test_\S+$/, hint: 'pk_test_' },
  STRIPE_SECRET_KEY: { re: /^(sk|rk)_test_\S+$/, hint: 'sk_test_ or rk_test_' },
};

function ask(label) {
  const format = FORMATS[label];
  return new Promise((resolve) => {
    let value = '';
    process.stdout.write(
      format && format.visible
        ? `\nType ${label}, then press Enter.\n> `
        : `\nCopy ${label}, then just press Enter here. No pasting needed: it is read from what you copied. It stays hidden.\n> `,
    );
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (chunk) => {
      const text = chunk.replace(/\x1b\[20[01]~/g, '');
      for (const ch of text) {
        if (ch === '\u0003') {
          stdin.setRawMode(false);
          process.stdout.write('\nStopped. Nothing more was saved.\n');
          process.exit(1);
        }
        if (ch === '\r' || ch === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(value.trim());
          return;
        }
        if (ch === '\u007f' || ch === '\b') {
          if (value) process.stdout.write('\b \b');
          value = value.slice(0, -1);
          continue;
        }
        if (ch >= ' ') {
          value += ch;
          process.stdout.write(format && format.visible ? ch : '*');
        }
      }
    };
    stdin.on('data', onData);
  });
}

function readClipboard() {
  const r = spawnSync('powershell.exe', ['-NoProfile', '-Command', 'Get-Clipboard -Raw'], { encoding: 'utf8' });
  return (r.stdout || '').trim();
}

function clearClipboard() {
  spawnSync('powershell.exe', ['-NoProfile', '-Command', 'Set-Clipboard -Value $null'], { encoding: 'utf8' });
}

function save(label, value) {
  let text = fs.readFileSync(ENV_FILE, 'utf8');
  const line = new RegExp('^' + label + '=.*$', 'm');
  text = line.test(text) ? text.replace(line, () => label + '=' + value) : text.replace(/\s*$/, '\n') + label + '=' + value + '\n';
  fs.writeFileSync(ENV_FILE, text);
}

(async () => {
  for (const label of process.argv.slice(2)) {
    const format = FORMATS[label];
    for (;;) {
      const typed = await ask(label);
      const fromClipboard = !typed && !(format && format.visible);
      const value = fromClipboard ? readClipboard() : typed;
      if (!value) {
        console.log('Nothing was found. Please copy it again, then press Enter.');
        continue;
      }
      if (/live/i.test(label) || /^(pk|sk|rk)_live_/.test(value)) {
        console.log('That is a LIVE key, so it was not saved. Please stop and check.');
        process.exit(1);
      }
      if (format && !format.re.test(value)) {
        console.log(`That does not look right. It should be ${format.hint}. It was not saved. Please try again.`);
        continue;
      }
      save(label, value);
      if (fromClipboard) clearClipboard();
      console.log(`Saved ${label}.`);
      break;
    }
  }
  console.log('\nAll done. You can go back to the chat.');
  process.exit(0);
})();
