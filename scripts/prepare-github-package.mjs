import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validatePublishTarget } from './publish-target.mjs';

const source = resolve(process.argv[2] ?? new URL('../dist', import.meta.url).pathname);
const destination = resolve(process.argv[3] ?? new URL('../dist-github', import.meta.url).pathname);
if (source === destination || destination.startsWith(`${source}/`)) {
  throw new Error(
    'GitHub distribution must be separate from the npm distribution.',
  );
}
const manifest = JSON.parse(
  readFileSync(resolve(source, 'package.json'), 'utf8'),
);
if (manifest.name !== '@revolist/ui')
  throw new Error('Only the UI package may be mirrored.');
validatePublishTarget(manifest, 'https://registry.npmjs.org/', 'public');
manifest.publishConfig = {
  registry: 'https://npm.pkg.github.com/',
  access: 'restricted',
};
manifest.repository = {
  type: 'git',
  url: 'git+https://github.com/revolist/revogrid-pro.git',
  directory: 'packages/ui',
};
validatePublishTarget(
  manifest,
  manifest.publishConfig.registry,
  manifest.publishConfig.access,
);
cpSync(source, destination, { recursive: true });
writeFileSync(
  resolve(destination, 'package.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
