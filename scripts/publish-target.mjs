import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const publicPackages = new Set([
  '@revolist/ui',
  ...['react', 'vue', 'angular', 'svelte'].map(
    (framework) => `@revolist/${framework}-charts`,
  ),
]);
const normalize = (registry) => `${registry.replace(/\/+$/, '')}/`;

/** UI also mirrors to GitHub Packages; product engines remain private. */
export function validatePublishTarget(manifest, registry, access) {
  const uiMirror =
    manifest.name === '@revolist/ui' &&
    normalize(registry) === 'https://npm.pkg.github.com/';
  const expectedRegistry =
    publicPackages.has(manifest.name) && !uiMirror
      ? 'https://registry.npmjs.org/'
      : 'https://npm.pkg.github.com/';
  const expectedAccess =
    publicPackages.has(manifest.name) && !uiMirror ? 'public' : 'restricted';
  if (
    normalize(registry) !== expectedRegistry ||
    access !== expectedAccess ||
    normalize(manifest.publishConfig?.registry ?? '') !== expectedRegistry ||
    manifest.publishConfig?.access !== expectedAccess
  ) {
    throw new Error(
      `${manifest.name} must publish to ${expectedRegistry} with ${expectedAccess} access.`,
    );
  }
}

export function publishNpmrc(registry) {
  const target = normalize(registry);
  if (
    !['https://registry.npmjs.org/', 'https://npm.pkg.github.com/'].includes(
      target,
    )
  )
    throw new Error('Unsupported publishing registry.');
  // Keep the token as an environment reference, never embed credentials in files.
  return `registry=${target}\n@revolist:registry=${target}\n${target.slice('https:'.length)}:_authToken=\${NODE_AUTH_TOKEN}\n`;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  validatePublishTarget(
    manifest,
    process.env.PUBLISH_REGISTRY,
    process.env.PUBLISH_ACCESS,
  );
  if (process.argv.includes('--npmrc'))
    process.stdout.write(publishNpmrc(process.env.PUBLISH_REGISTRY));
}
