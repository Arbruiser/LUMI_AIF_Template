
# LUMI AIF Learning Template

A modern, stylish replacement for the Just-the-Docs template. Authors only ever touch `.md` files in a `content/` folder. Everything else (sidebar, theming, callouts, dark mode) is automatic.

## What the author experiences

1. Click **Use this template** on the GitHub repo.
2. Enable GitHub Pages → Source: GitHub Actions.
3. Open `content/index.md` and start writing. Add new pages by creating new `.md` files in `content/` (or a subfolder for chapters with subchapters).
4. Push to `main` → site rebuilds and redeploys automatically.

The `index.md` and `chapter1.md` shipped with the template double as the user manual, exactly like today — improved and updated for the new callout types.

## Authoring model (Markdown frontmatter)

Same mental model as Just-the-Docs so current authors aren't retrained:

```yaml
---
title: "Chapter 1 — Getting Started with LUMI"
nav_order: 2
parent: "Optional parent title"   # for subchapters
has_children: true                # for chapter index pages
---
```

Supported markdown features:
- Headings, lists, links, images (`./assets/...` relative paths work)
- Fenced code blocks with syntax highlighting + copy button
- Inline `code`
- Math via KaTeX (`$inline$` and `$$block$$`)
- YouTube embeds (paste the iframe, or use `{% youtube ID %}`-style shortcode)
- Four callout types (see below)
- Tables, blockquotes, horizontal rules

## Callouts

Authors write callouts with a simple syntax (kept identical-feeling to `{: .note }`):

```md
> [!note] Optional title
> Body text in **purple** styling.

> [!warning] Optional title
> Body text in **magenta** styling.

> [!tip] Optional title
> Body text in **teal** (LUMI effect colour).

> [!info] Optional title
> Body text in **blue** styling.

> [!command]
> srun --pty bash
```

`note` (purple), `warning` (magenta), `tip` (teal #28c0d2), `info` (blue), and `command` (highlighted shell block with copy button) — all branded and theme-aware.

## Layout

Docs-style three-zone:

```text
┌──────────────────────────────────────────────────────┐
│  [LUMI AIF logo]   Title                  [☼/☾] [↗] │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │   Markdown content                        │
│ (chapters│                                           │
│  + sub-  │   Wide, comfortable reading column        │
│  chapters│                                           │
│  collap- │                                           │
│  sible)  │                                           │
│          │                                           │
└──────────┴───────────────────────────────────────────┘
```

- Left sidebar: auto-built from `nav_order`/`parent`. Collapsible groups, current page highlighted, mini-icon collapse on small screens.
- Header: LUMI AIF logo (light/dark variants), site title from config, theme toggle, "LUMI AIF Website" external link.
- Main: generous reading width, anchor links on headings, "Edit this page on GitHub" link in the footer.
- Mobile: sidebar becomes off-canvas drawer.

## Theming

- LUMI AIF colour tokens defined in `src/styles.css` as `oklch` semantic tokens — no hardcoded colours anywhere in components.
- Light and dark palettes both derived from the LUMI brand palette + white mixes (light) and brand palette + black mixes (dark).
- Default = follow system, with a header toggle that persists choice in localStorage.
- Typography: Inter (free, close in feel to Mr Eaves XL Mod) for body and headings. Mono via JetBrains Mono. Note in the README: Mr Eaves XL Mod is licensed and not free; if the author has a license they can drop the woff2 into `public/fonts/` and uncomment one line in `styles.css`.

## Site configuration

A single `site.config.ts` (or `content/_config.md` frontmatter) lets the author set:
- Site title, description
- External "aux" links shown in the header
- GitHub repo URL (powers the "Edit on GitHub" links)
- Optional logo override

## GitHub Pages deployment

Ships with `.github/workflows/deploy.yml` that:
- Installs deps, builds the static site (`vite build` to fully prerendered HTML)
- Sets the correct `base` path for `https://<user>.github.io/<repo>/`
- Deploys to the `gh-pages` environment via `actions/deploy-pages`

Local preview: `bun install && bun run dev`. README documents this for the slightly-technical authors.

## Updated author-facing instructions (replaces current README)

Same structure as today's instructions, lightly cleaned up:

1. Click **Use this template** and name the repo for your materials.
2. Settings → Pages → Source: **GitHub Actions**.
3. Wait for the green tick next to your commit.
4. Click the gear ⚙ next to **About**, tick **Use your GitHub Pages website**, Save.
5. Edit `content/index.md` (the home page — keep this filename). Add chapters by creating more `.md` files in `content/`.
6. Push to GitHub → site redeploys automatically. Hard-refresh with Ctrl/Cmd+Shift+R if you don't see changes.

---

## Technical details (for reference)

- **Stack**: TanStack Start (Vite 7 + React 19) — Lovable's default. Configured for SSG/prerender so the output is fully static HTML for GitHub Pages.
- **Markdown pipeline**: `import.meta.glob('/content/**/*.md', { query: '?raw', eager: true })` loads all markdown at build time. Parsed with `unified` + `remark-parse` + `remark-gfm` + `remark-math` + `remark-directive` (for callouts) → `rehype-katex` + `rehype-highlight` + `rehype-slug` + `rehype-autolink-headings` → React via `rehype-react`.
- **Routing**: A single TanStack catch-all route `/$` reads the slug, looks up the parsed markdown entry, renders it. Sidebar tree is built once from the glob result.
- **Brand assets**: LUMI AIF horizontal logo (light + dark variants) shipped in `public/brand/`. Author can swap them.
- **Files the author should never need to open**: anything outside `content/`, `public/brand/` (optional), and `site.config.ts`.
- **Files to add/replace**:
  - `content/index.md`, `content/chapter1.md` — ported & expanded from uploads
  - `src/styles.css` — full LUMI token palette (light + dark)
  - `src/lib/content.ts` — markdown loader + nav tree builder
  - `src/components/AppSidebar.tsx`, `Header.tsx`, `Callout.tsx`, `CodeBlock.tsx`, `ThemeToggle.tsx`
  - `src/routes/__root.tsx` — sidebar layout shell
  - `src/routes/index.tsx` → renders `content/index.md`
  - `src/routes/$.tsx` — catch-all for other pages
  - `.github/workflows/deploy.yml`
  - `site.config.ts`
  - `README.md` — author instructions
- **Repo**: code lands in the existing Lovable project; the user pushes it to `Arbruiser/LUMI_AIF_template_Loveable` from the Lovable GitHub integration.
