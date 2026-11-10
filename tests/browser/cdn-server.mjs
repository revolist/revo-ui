// Serve only the extracted public archive. No source transforms or node_modules.
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = new URL('../../', import.meta.url);
const { version } = JSON.parse(
  readFileSync(new URL('package.json', root), 'utf8'),
);
const temp = mkdtempSync(join(tmpdir(), 'ui-cdn-browser-'));
execFileSync('tar', [
  '-xf',
  new URL(`artifacts/revolist-ui-${version}.tgz`, root).pathname,
  '-C',
  temp,
]);
const files = resolve(temp, 'package');
const server = createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>CDN fixture</title>');
    return;
  }
  const path = resolve(
    files,
    '.' + new URL(request.url, 'http://localhost').pathname,
  );
  if (!path.startsWith(files + '/')) {
    response.writeHead(403);
    response.end();
    return;
  }
  try {
    if (!statSync(path).isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type':
        {
          '.js': 'text/javascript',
          '.mjs': 'text/javascript',
          '.css': 'text/css',
        }[extname(path)] ?? 'application/octet-stream',
    });
    response.end(readFileSync(path));
  } catch {
    response.writeHead(404);
    response.end();
  }
});
server.listen(5199, '127.0.0.1');
function close() {
  server.close(() => {
    rmSync(temp, { recursive: true, force: true });
    process.exit(0);
  });
}
process.on('SIGTERM', close);
process.on('SIGINT', close);
