import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Pages and coverage share browser setup that repairs the Ubuntu mirror before installing dependencies', () => {
  for (const name of ['pages', 'coverage']) {
    const workflow = readFileSync(
      new URL(`../.github/workflows/${name}.yml`, import.meta.url),
      'utf8',
    );
    assert.match(workflow, /run: node scripts\/install-ci-browser.mjs/);
    assert.doesNotMatch(workflow, /run: pnpm.*playwright install --with-deps/);
  }
});

const { installCiBrowser } = await import('./install-ci-browser.mjs');
test('replaces Azure DNS dependency with official HTTPS mirrors while retaining full dependency installation', () => {
  const calls = [];
  installCiBrowser({
    exists: () => true,
    read: () =>
      '# mirror priorities\nhttp://azure.archive.ubuntu.com/ubuntu/ priority:1\nhttps://archive.ubuntu.com/ubuntu/ priority:2\n',
    run: (...args) => calls.push(args),
  });
  assert.equal(calls[0][0], 'sudo');
  assert.deepEqual(calls[0][1], ['tee', '/etc/apt/apt-mirrors.txt']);
  assert.match(
    calls[0][2].input,
    /https:\/\/archive.ubuntu.com\/ubuntu\/ priority:1/,
  );
  assert.match(
    calls[1][2].input,
    /https:\/\/security.ubuntu.com\/ubuntu\/ priority:1/,
  );
  assert(
    calls.slice(0, 2).every((call) => !call[2].input.includes('azure.archive')),
  );
  assert.deepEqual(calls[2], [
    'pnpm',
    ['exec', 'playwright', 'install', '--with-deps', 'chromium'],
    { stdio: 'inherit' },
  ]);
});

test('leaves already configured mirrors untouched and works when mirror-list files are absent', () => {
  for (const present of [false, true]) {
    const calls = [];
    installCiBrowser({
      exists: () => present,
      read: () => 'https://archive.ubuntu.com/ubuntu/\n',
      run: (...args) => calls.push(args),
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'pnpm');
  }
});

test('does not hide mirror repair or browser installation failures', () => {
  for (const stage of ['sudo', 'pnpm']) {
    assert.throws(
      () =>
        installCiBrowser({
          exists: () => true,
          read: () => 'http://azure.archive.ubuntu.com/ubuntu/',
          run: (command) => {
            if (command === stage) throw new Error(`${stage} failed`);
          },
        }),
      new RegExp(`${stage} failed`),
    );
  }
});
