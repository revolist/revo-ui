import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Hosted Ubuntu runners can point apt at an unavailable Azure mirror. Keep the
// same suites and packages, but fetch them from Ubuntu's official HTTPS hosts.
export function installCiBrowser({
  exists = existsSync,
  read = readFileSync,
  run = execFileSync,
} = {}) {
  for (const file of [
    '/etc/apt/apt-mirrors.txt',
    '/etc/apt/apt-mirrors-security.txt',
  ]) {
    if (!exists(file)) continue;
    const source = read(file, 'utf8');
    const host = file.includes('-security')
      ? 'security.ubuntu.com'
      : 'archive.ubuntu.com';
    const updated = source.replace(
      /https?:\/\/azure\.archive\.ubuntu\.com(?=\/ubuntu(?:\/|\s|$))/g,
      `https://${host}`,
    );
    if (updated !== source) {
      run('sudo', ['tee', file], {
        input: updated,
        stdio: ['pipe', 'ignore', 'inherit'],
      });
    }
  }
  run('pnpm', ['exec', 'playwright', 'install', '--with-deps', 'chromium'], {
    stdio: 'inherit',
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  installCiBrowser();
}
