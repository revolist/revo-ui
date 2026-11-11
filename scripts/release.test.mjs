import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  releaseVersion,
  stampRelease,
  publicationNeeded,
  publishRelease,
} from "./release.mjs";
const manifest = {
  name: "@revolist/ui",
  version: "4.0.8",
  publishConfig: { registry: "https://registry.npmjs.org/", access: "public" },
  revoUiRelease: { version: "4.0.8", commit: "a".repeat(40) },
};
test("normalizes version tags, supports prereleases, and rejects malformed/unsafe registry versions", () => {
  for (const value of ["4.0.8", "v4.0.8", "4.1.0-rc.1", "4.1.0-beta-long"])
    assert.equal(releaseVersion(value), value.replace(/^v/, ""));
  for (const value of [
    "main",
    "4.0",
    "04.0.0",
    "4.0.0-01",
    "4.0.0+build",
    "4.0.0;exit",
    "4.0.0\n",
  ])
    assert.throws(() => releaseVersion(value));
});
test("stamps immutable source metadata, preserves exports and mirrors repository ownership", () => {
  const root = mkdtempSync(join(tmpdir(), "ui-release-"));
  try {
    const source = join(root, "dist"),
      target = join(root, "github");
    mkdirSync(source);
    writeFileSync(
      join(source, "package.json"),
      JSON.stringify({ ...manifest, exports: { ".": "./native.js" } }),
    );
    assert.equal(stampRelease(source, "v4.1.0-rc.1", "b".repeat(40)), "next");
    const npm = JSON.parse(readFileSync(join(source, "package.json")));
    assert.equal(npm.version, "4.1.0-rc.1");
    assert.equal(npm.revoUiRelease.commit, "b".repeat(40));
    execFileSync(process.execPath, [
      new URL("prepare-github-package.mjs", import.meta.url).pathname,
      source,
      target,
    ]);
    const mirror = JSON.parse(readFileSync(join(target, "package.json")));
    assert.equal(
      mirror.repository.url,
      "git+https://github.com/revolist/revo-ui.git",
    );
    assert.equal(mirror.repository.directory, undefined);
    assert.deepEqual(mirror.revoUiRelease, npm.revoUiRelease);
    assert.deepEqual(
      JSON.parse(readFileSync(join(source, "package.json"))),
      npm,
    );
    assert.throws(() => stampRelease(source, "4.1.0", "main"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test("publishes only missing versions and skips matching source metadata for safe partial retries", async () => {
  let request;
  assert.equal(
    await publicationNeeded(
      manifest,
      manifest.publishConfig.registry,
      "public",
      "token",
      async (url, init) => {
        request = [url, init];
        return { status: 404 };
      },
    ),
    true,
  );
  assert.match(request[0], /%40revolist%2Fui$/);
  assert.equal(request[1].headers.authorization, "Bearer token");
  assert.equal(
    await publicationNeeded(
      manifest,
      manifest.publishConfig.registry,
      "public",
      "token",
      async () => ({
        ok: true,
        status: 200,
        json: async () => ({ versions: { [manifest.version]: manifest } }),
      }),
    ),
    false,
  );
});
test("rejects registry errors, version conflicts and mismatched publication targets", async () => {
  for (const status of [401, 403, 429, 500])
    await assert.rejects(
      publicationNeeded(
        manifest,
        manifest.publishConfig.registry,
        "public",
        "token",
        async () => ({ status, ok: false }),
      ),
      new RegExp(String(status)),
    );
  await assert.rejects(
    publicationNeeded(
      manifest,
      manifest.publishConfig.registry,
      "public",
      "token",
      async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          versions: {
            [manifest.version]: {
              ...manifest,
              revoUiRelease: { commit: "b".repeat(40) },
            },
          },
        }),
      }),
    ),
    /does not match/,
  );
  await assert.rejects(
    publicationNeeded(
      manifest,
      "https://npm.pkg.github.com/",
      "public",
      "token",
    ),
    /must publish/,
  );
});
test("workflow separates trusted automation from released source and gates publication behind validation", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/publish.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflow, /types: \[published\]/);
  assert.match(workflow, /needs: validate/);
  assert.match(workflow, /merge-base --is-ancestor "\$SHA" origin\/main/);
  assert.match(workflow, /ref: \$\{\{ steps.source.outputs.sha \}\}/);
  assert.match(
    workflow,
    /node automation\/scripts\/release.mjs stamp source\/dist/,
  );
  assert.doesNotMatch(workflow, /secrets.NPM_TOKEN/);
  assert.match(workflow, /secrets.GITHUB_TOKEN/);
  assert.equal(workflow.match(/if: inputs.dry_run != true/g).length, 2);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /queue: max/);
  assert.equal(workflow.match(/package-manager-cache: false/g).length, 2);
});

test("public npm metadata lookup sends no authorization without a token", async () => {
  let headers;
  await publicationNeeded(
    manifest,
    manifest.publishConfig.registry,
    "public",
    undefined,
    async (_url, init) => {
      headers = init.headers;
      return { status: 404 };
    },
  );
  assert.equal(Object.hasOwn(headers, "authorization"), false);
});

test("standalone and reusable publication use OIDC without an npm credential", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/publish.yml", import.meta.url),
    "utf8",
  );
  const npmStep = workflow.slice(
    workflow.indexOf("      - name: Publish npm package"),
    workflow.indexOf("      - name: Publish GitHub Packages mirror"),
  );
  assert.doesNotMatch(workflow, /secrets\.NPM_TOKEN|Check npm credential/);
  assert.doesNotMatch(npmStep, /NODE_AUTH_TOKEN|_authToken|--npmrc/);
  assert.doesNotMatch(workflow, /npm-token|REPO_TOKEN/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /NODE_AUTH_TOKEN: \$\{\{ secrets.GITHUB_TOKEN \}\}/);
});

test("npm publishes through the OIDC-capable CLI without requiring a long-lived credential", async () => {
  const calls = [];
  await publishRelease({
    manifest,
    registry: manifest.publishConfig.registry,
    access: "public",
    archive: "fixture.tgz",
    fetchImpl: async (_url, init) => {
      assert.equal(init.headers.authorization, undefined);
      return { status: 404 };
    },
    run: (client, args) => {
      calls.push([client, args]);
      return "11.12.1";
    },
  });
  assert.deepEqual(calls[0], ["npm", ["--version"]]);
  assert.equal(calls[1][0], "npm");
  assert.equal(calls[1][1][0], "publish");
  assert(calls[1][1].includes("--tag=latest"));
  assert(!calls[1][1].includes("--no-git-checks"));
});

test("GitHub mirror retains token authentication and pnpm publishing", async () => {
  const mirror = {
    ...manifest,
    publishConfig: {
      registry: "https://npm.pkg.github.com/",
      access: "restricted",
    },
  };
  let call;
  const options = {
    manifest: mirror,
    registry: mirror.publishConfig.registry,
    access: "restricted",
    archive: "mirror.tgz",
    fetchImpl: async (_url, init) => {
      assert.equal(init.headers.authorization, "Bearer github-token");
      return { status: 404 };
    },
    run: (...args) => {
      call = args;
    },
  };
  await assert.rejects(
    publishRelease(options),
    /GitHub Packages publication credential/,
  );
  await publishRelease({ ...options, token: "github-token" });
  assert.equal(call[0], "pnpm");
  assert(call[1].includes("--no-git-checks"));
});

test("outdated npm clients cannot start a trusted publication", async () => {
  for (const version of ["10.9.0", "11.5.0"]) {
    const calls = [];
    await assert.rejects(
      publishRelease({
        manifest,
        registry: manifest.publishConfig.registry,
        access: "public",
        archive: "fixture.tgz",
        fetchImpl: async () => ({ status: 404 }),
        run: (client, args) => {
          calls.push([client, args]);
          return version;
        },
      }),
      /npm CLI >=11.5.1/,
    );
    assert.equal(calls.length, 1);
  }
});

test('reusable UI publisher explicitly checks out its own repository and uses caller OIDC', () => {
 const workflow=readFileSync(new URL('../.github/workflows/publish.yml',import.meta.url),'utf8');
 assert.match(workflow,/workflow_call:/);
 assert.doesNotMatch(workflow,/npm-token|REPO_TOKEN/);
 assert.equal(workflow.match(/repository: revolist\/revo-ui/g)?.length,3);
 assert.match(workflow,/ref: \$\{\{ inputs.automation_ref \|\| github.sha \}\}/);
});
