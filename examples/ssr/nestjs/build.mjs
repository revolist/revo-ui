import { build } from "esbuild";

await build({
  entryPoints: ["src/client.ts"],
  bundle: true,
  format: "esm",
  outdir: "public",
  loader: { ".css": "css", ".svg": "file", ".gif": "file" },
});
