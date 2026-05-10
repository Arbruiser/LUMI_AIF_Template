// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static-site build for GitHub Pages:
//   - Disable the Cloudflare Workers adapter (we don't deploy to a Worker).
//   - Enable TanStack Start's SPA mode so the build prerenders to static HTML.
//   - Honour VITE_BASE_PATH so the site works under /<repo>/ on project pages.
const basePath = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
    pages: [{ path: "/", prerender: { enabled: true, crawlLinks: true } }],
  },
  vite: {
    base: basePath,
  },
});
