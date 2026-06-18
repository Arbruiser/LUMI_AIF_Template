// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import type { Plugin } from "vite";
// Note: do NOT import ./site.config here — it reads import.meta.env, which is
// undefined when vite.config.ts itself runs in Node, and would crash the build.

const basePath = process.env.VITE_BASE_PATH || "/";

function walkMd(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

function fileToSlug(filePath: string): string {
  const rel = relative("content", filePath).replace(/\\/g, "/").replace(/\.md$/, "");
  return rel === "index" ? "" : rel;
}

function joinUrl(a: string, b: string) {
  return `${a.replace(/\/$/, "")}/${b.replace(/^\//, "")}`;
}

// Generate sitemap.xml + robots.txt at build time from markdown content.
function sitemapPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "lumi-sitemap",
    apply: "build",
    configResolved(cfg) {
      outDir = cfg.build.outDir;
    },
    closeBundle() {
      try {
        const files = walkMd("content");
        const base = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
        if (!base) return;
        const urls = files.map((f) => {
          const slug = fileToSlug(f);
          const loc = slug === "" ? `${base}/` : `${base}/${slug}`;
          const lastmod = statSync(f).mtime.toISOString().slice(0, 10);
          return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
        });
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
        const robots = `User-agent: *\nAllow: /\n\nSitemap: ${joinUrl(base, "sitemap.xml")}\n`;
        // Force write to dist/client so it gets uploaded to GitHub Pages
        const finalDir = join(process.cwd(), "dist", "client");
        mkdirSync(finalDir, { recursive: true });
        writeFileSync(join(finalDir, "sitemap.xml"), xml);
        writeFileSync(join(finalDir, "robots.txt"), robots);
      } catch (e) {
        // Don't fail the build on sitemap errors.
        // eslint-disable-next-line no-console
        console.warn("[lumi-sitemap] skipped:", e);
      }
    },
  };
}

// Work around three TanStack Start / Nitro preview issues:
// 1) preview-server plugin hardcodes `dist/server/server.js` but Nitro outputs `index.mjs`.
// 2) Nitro's Cloudflare preset mutates `req.ip`, but srvx NodeRequest has it as read-only.
// 3) Cloudflare preset expects `env.ASSETS`, but preview server doesn't pass `env`.
function serverJsCompatPlugin(): Plugin {
  return {
    name: "lumi-server-js-compat",
    apply: "build",
    closeBundle() {
      try {
        const serverDir = join(process.cwd(), "dist", "server");
        const indexPath = join(serverDir, "index.mjs");
        const serverPath = join(serverDir, "server.js");
        if (existsSync(indexPath)) {
          let code = readFileSync(indexPath, "utf-8");
          // Patch augmentReq so the preview server doesn't crash on read-only ip
          code = code.replace(
            "req.ip = cfReq.headers.get(\"cf-connecting-ip\") || void 0;",
            "try { req.ip = cfReq.headers.get(\"cf-connecting-ip\") || void 0; } catch {}"
          );
          // Patch env.ASSETS access when env is undefined in preview
          code = code.replace(
            "if (env.ASSETS && isPublicAssetURL(url.pathname)) {",
            "if (env?.ASSETS && isPublicAssetURL(url.pathname)) {"
          );
          writeFileSync(indexPath, code);
          if (!existsSync(serverPath)) {
            copyFileSync(indexPath, serverPath);
          }
        }
      } catch {
        // ignore
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
    pages: [{ path: "/", prerender: { enabled: true, crawlLinks: true } }],
  },
  vite: {
    base: basePath,
    plugins: [sitemapPlugin()],
  },
});
