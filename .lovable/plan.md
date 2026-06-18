# Audit: the two confetti-era workarounds

Neither workaround is about confetti. Both patch the **production build path**, which only got exercised while iterating on confetti. Here's what each one is, and whether it should stay.

## 1. `src/lib/content.ts` — the fake `Buffer` shim

```ts
(globalThis as any).Buffer = { from: (i) => i, isBuffer: () => false };
```

**Why it exists:** `gray-matter` (used to parse markdown frontmatter) references the global `Buffer`. The content is parsed in the browser bundle (`import.meta.glob(..., { query: '?raw', eager: true })`), so `Buffer` must exist there.

**Why it's not great:** It's a fake object that lies — `from` returns the input unchanged and `isBuffer` always returns `false`. It happens to work only because, for string input, gray-matter never actually needs a real Buffer. If gray-matter ever hits its `toBuffer`/stringify path, this silently breaks.

**The clean fix:** The real `buffer` polyfill is *already* a dependency (`"buffer": "^6.0.3"`). Assign the real thing to the global instead of a fake:

```ts
import { Buffer } from "buffer";
if (typeof globalThis !== "undefined" && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}
```

I confirmed this exact pattern parses the project's frontmatter correctly. The earlier note that "`import from 'buffer'` caused Rollup errors" was most likely a misdiagnosis — importing the *named* `Buffer` and assigning it to the global is different from relying on auto-injection, and I'll confirm with a real build.

## 2. `vite.config.ts` — `serverJsCompatPlugin`

This post-processes `dist/server/index.mjs` after build to work around three TanStack Start / Nitro **preview-server** quirks: the `server.js` filename mismatch, a read-only `req.ip` assignment, and `env.ASSETS` being undefined.

**The open question:** these were added to stop 500s during a *local* `vite preview` / prerender run. It's unclear whether the actual Lovable preview pipeline needs them. The only honest way to know is to build with and without it.

## Plan

1. **`src/lib/content.ts`** — replace the fake shim with the real `buffer` import (above). Keep `gray-matter` and the `buffer` dependency as-is.
2. **Verify the build** — run a full production build. Confirm content pages render and frontmatter (`title`, `nav_order`, glossary) is parsed correctly.
3. **Test `serverJsCompatPlugin` necessity** — temporarily disable it and rebuild/preview:
   - If the preview still works → remove the plugin entirely (dead workaround).
   - If it 500s → keep it, but tighten the comment to state exactly which framework versions need it so it can be removed on the next upgrade.
4. **Leave alone:** `src/components/Confetti.tsx` (working as intended), `sitemapPlugin` (unrelated, fine), and the `buffer` dependency (now legitimately used).

## Out of scope

No visual/behavioral changes to confetti or any UI. This is purely replacing a hacky shim with the correct polyfill and removing build-pipeline cruft that isn't pulling its weight.
