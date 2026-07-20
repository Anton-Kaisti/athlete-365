import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const files = [
  ["index.html", "text/html; charset=utf-8"],
  ["reset-update.html", "text/html; charset=utf-8"],
  ["manifest.webmanifest", "application/manifest+json; charset=utf-8"],
  ["sw.js", "text/javascript; charset=utf-8"],
  ["src/app.js", "text/javascript; charset=utf-8"],
  ["src/program.js", "text/javascript; charset=utf-8"],
  ["src/state.js", "text/javascript; charset=utf-8"],
  ["src/styles.css", "text/css; charset=utf-8"]
];

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "server"), { recursive: true });

const assets = {};
for (const [path, contentType] of files) {
  assets[`/${path}`] = {
    contentType,
    body: await readFile(join(root, path), "utf8")
  };
}
assets["/"] = assets["/index.html"];

const worker = `const ASSETS = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/" : decodeURIComponent(url.pathname);
    const asset = ASSETS[path] || ASSETS[path.replace(/^\\//, "/")];
    if (!asset) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(asset.body, {
      headers: {
        "content-type": asset.contentType,
        "cache-control": path === "/sw.js" ? "no-cache" : "public, max-age=300"
      }
    });
  }
};
`;

await writeFile(join(dist, "server", "index.js"), worker);
