import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { validatePublishTarget } from "./publish-target.mjs";

export function releaseVersion(value) {
  const version = value.replace(/^v/, "");
  if (
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(
      version,
    )
  )
    throw new Error(
      "A registry SemVer version without build metadata is required.",
    );
  const prerelease = version.split("+")[0].split("-").slice(1).join("-");
  if (
    prerelease
      .split(".")
      .some((part) => /^\d+$/.test(part) && part.length > 1 && part[0] === "0")
  )
    throw new Error(
      "Prerelease numeric identifiers cannot have leading zeroes.",
    );
  return version;
}
export function stampRelease(root, version, commit) {
  version = releaseVersion(version);
  if (!/^[a-f0-9]{40}$/.test(commit))
    throw new Error("A full source commit SHA is required.");
  const file = resolve(root, "package.json");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.name !== "@revolist/ui")
    throw new Error("Only @revolist/ui may be released.");
  manifest.version = version;
  manifest.revoUiRelease = { version, commit };
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  return version.includes("-") ? "next" : "latest";
}
export async function publicationNeeded(
  manifest,
  registry,
  access,
  token,
  fetchImpl = fetch,
) {
  validatePublishTarget(manifest, registry, access);
  const url = `${registry.replace(/\/$/, "")}/${encodeURIComponent(manifest.name)}`;
  const response = await fetchImpl(url, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  if (response.status === 404) return true;
  if (!response.ok)
    throw new Error(
      `Registry lookup failed (${response.status}); refusing to publish.`,
    );
  const packument = await response.json();
  if (!packument.versions || typeof packument.versions !== "object")
    throw new Error("Invalid registry metadata; refusing to publish.");
  const existing = packument.versions[manifest.version];
  if (!existing) return true;
  const expected = manifest.revoUiRelease;
  if (
    !expected ||
    existing.revoUiRelease?.commit !== expected.commit ||
    existing.revoUiRelease?.version !== expected.version
  )
    throw new Error(
      `Existing ${manifest.name}@${manifest.version} does not match this source commit. Choose a new version.`,
    );
  return false;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [command, root] = process.argv.slice(2);
  if (command === "stamp") {
    console.log(
      `dist_tag=${stampRelease(root, process.env.RELEASE_VERSION, process.env.SOURCE_SHA)}`,
    );
  } else if (command === "publish") {
    const manifest = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    );
    const registry = process.env.PUBLISH_REGISTRY,
      access = process.env.PUBLISH_ACCESS;
    const token = process.env.NODE_AUTH_TOKEN;
    if (!token) throw new Error("Missing registry publication credential.");
    if (await publicationNeeded(manifest, registry, access, token)) {
      execFileSync(
        "pnpm",
        [
          "publish",
          resolve(process.env.RELEASE_ARCHIVE),
          `--registry=${registry}`,
          `--access=${access}`,
          `--tag=${manifest.version.includes("-") ? "next" : "latest"}`,
          "--no-git-checks",
        ],
        { stdio: "inherit" },
      );
    } else
      console.log(
        `${manifest.name}@${manifest.version} already published from the same source; skipping this registry.`,
      );
  } else throw new Error("Expected stamp or publish command.");
}
