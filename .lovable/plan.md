## Selected upgrades

### 1. Copy-link on headings (visible affordance)
The click-to-copy logic already exists in `MarkdownRenderer` but the autolink renders an empty span, so users can't see it.
- Switch `rehypeAutolinkHeadings` content to a small link-icon SVG (or use a `behavior: "append"` with an `<svg>` element node).
- Style `.heading-anchor` in `styles.css`: hidden by default, fades in on heading hover, magenta on hover, sits to the right of the heading text.
- Show a tiny "Link copied" toast (reuse existing `sonner` already in `components/ui`).

### 2. Code block: filename + line numbers
- Extend the markdown info-string parsing in `CodeBlock`. ReactMarkdown only forwards `language-xxx` in `className`, so we'll move parsing to `MarkdownRenderer`'s `pre` component: read `child.props.className` plus `child.props.metaString` (need a small remark plugin OR a regex on the meta via `remark-directive`-style — simplest is to add `remark-flexible-code-titles`, a tiny well-maintained plugin that turns ` ```python title="train.py" {1,3-5} ` into a `<div class="remark-code-title">` + className tokens).
- Render the title as a styled chrome bar above the existing code chrome (or replace the `lang` label when title is set).
- Line numbers: add a `pre.with-line-numbers` CSS treatment using `counter-reset` on `<code>` and `::before` on each `<span class="line">`. To get per-line spans, swap `rehype-highlight` for `rehype-pretty-code` (or keep highlight and post-process). Recommended approach: use `rehype-pretty-code` with Shiki — handles title, line numbers, and line highlighting natively in one plugin and matches the "title + highlight ranges" goal cleanly. We'd remove `rehype-highlight` and `highlight.js` styles, and ship a single Shiki theme that respects light/dark via CSS variables.
- Terminal variant in `CodeBlock` keeps its current chrome but gains the same line-number CSS when meta requests it.

### 3. Image lightbox
- Wrap `img` renderer output in a `<button>` that opens a Dialog (shadcn `dialog` already present).
- Lightbox shows the full-size image centered on a dimmed backdrop, caption from `alt`, ESC / backdrop click to close.
- Skip wrapping for tiny inline images (e.g., badges) by checking natural width on load; default behavior: every content `<img>` is clickable.

### 4. Sitemap.xml + robots.txt
- Add a build-time generator using a small Vite plugin in `vite.config.ts`:
  - On `buildEnd` (or via `closeBundle`), read all `content/**/*.md`, derive slugs the same way `lib/content.ts` does, write `dist/sitemap.xml` with `<url><loc>${siteConfig.url}/${slug}</loc></url>` and `<lastmod>` from file mtime.
  - Write `dist/robots.txt`:
    ```
    User-agent: *
    Allow: /
    Sitemap: ${siteConfig.url}/sitemap.xml
    ```
- Requires `siteConfig.url` (production URL) — add the field to `site.config.ts` if missing.

### 5. Drop-cap + tighter heading rhythm
- In `styles.css` under `.prose-lumi`:
  - First-paragraph drop-cap: `.prose-lumi > p:first-of-type::first-letter { float: left; font-size: 3.2em; line-height: 0.9; padding-right: 0.08em; color: var(--lumi-magenta); font-weight: 700; }`. Skip when the first block is a heading (already true via `:first-of-type`) or a callout.
  - Heading rhythm: tighten `h2 { margin-top: 2.5rem; margin-bottom: 0.75rem; }`, `h3 { margin-top: 1.75rem; margin-bottom: 0.5rem; }`, lift heading `letter-spacing: -0.01em`.
  - Wide-screen body line-height: `@media (min-width: 1280px) { .prose-lumi p { line-height: 1.75; } }`.

## Files to touch
- `src/components/MarkdownRenderer.tsx` — autolink icon, lightbox wrapper, code block plugin wiring
- `src/components/CodeBlock.tsx` — title bar, line-number support
- `src/styles.css` — anchor styles, drop-cap, heading rhythm, line-number CSS, code theme vars
- `vite.config.ts` — sitemap/robots plugin
- `site.config.ts` — add `url`
- `package.json` — add `rehype-pretty-code` + `shiki` (and `remark-flexible-code-titles` only if we keep `rehype-highlight`); remove `rehype-highlight` + `highlight.js` if we switch to Shiki

## Open question
For code blocks, two paths:
- **A. Switch to `rehype-pretty-code` + Shiki** — best result (titles, line numbers, line highlight all built in, themable via CSS vars), but replaces the current syntax highlighter so existing colors will change.
- **B. Keep `rehype-highlight`, add `remark-flexible-code-titles` + custom CSS for line numbers** — preserves current highlighting, more glue code, no built-in line-range highlighting.

I'll go with **A** unless you prefer to keep current colors.
