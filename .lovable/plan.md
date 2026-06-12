## Goal

Improve glossary UX, SEO, and fix the hydration error — **without adding any work for content creators**. Everything stays driven by the same markdown files and the same glossary table they already edit.

---

## 1. Per-page descriptions & JSON-LD (zero creator work)

**Answer to your question:** No, creators will NOT have to set a description per page. We auto-derive it.

- Add a helper that, for any page, produces a description by taking the **first real paragraph** of the markdown body (strip headings, callout markers, code, links → plain text, truncate ~155 chars). If a creator *happens* to add `description:` in front matter, we use that; otherwise we fall back to the auto-derived text. Either way it's optional.
- Wire this into `head()` in `src/routes/index.tsx` and `src/routes/$.tsx` so every page emits a unique `description`, `og:title`, `og:description`, and `og:type` (`website` for home, `article` for content pages).
- **JSON-LD:**
  - Root (`__root.tsx`): a sitewide `Course` schema (name + description from `site.config.ts`) — represents the whole learning site once.
  - Content pages (`$.tsx`, `index.tsx`): an `Article` schema (headline = page title, description = derived description) plus a `BreadcrumbList` built from the existing breadcrumb trail.
- No new front matter is required. Creators keep writing plain markdown.

## 2. Auto-generated glossary linking (less work, more consistent)

Today a creator must type `Term%` everywhere they want a glossary link, which is easy to forget — so the same term gets linked on one page and not another (inconsistent).

- Change `applyGlossaryMarkers` so glossary terms are linked **automatically**, no `%` needed. To avoid clutter we link the **first occurrence of each term per page** only.
- The existing `%` marker still works (forces a link) so nothing breaks for current content, but it becomes optional.
- Safety exclusions (unchanged behavior): never link inside headings, code spans/fences, existing links, or on the glossary page itself. Longest-match wins for multi-word terms.
- Result: creators write normal prose and glossary terms light up consistently everywhere.

## 3. Dedicated glossary page layout

- Add a `GlossaryList` component that renders the parsed glossary as a clean, **alphabetically sorted** definition list (styled term/definition cards using existing LUMI tokens), each with an `id` anchor so terms are deep-linkable (`/glossary#markdown`).
- On the glossary route, render this styled list **in place of** the raw markdown table (the instructional text above the table stays as-is). Creators still edit the exact same markdown table — only the presentation improves, so it's zero extra work.

## 4. Fix the hydration warning

- Root cause: `HoverCardContent` renders its `<div>` inline (no portal), and glossary terms sit inside markdown `<p>` elements → `<div>` inside `<p>` → hydration error.
- Fix: wrap the content in `@radix-ui/react-hover-card`'s `Portal` in `src/components/ui/hover-card.tsx`. This moves the popover to the document body, eliminating the invalid nesting. No visual change.

---

## Technical details

- **Files touched:**
  - `src/lib/content.ts` — add `getPageDescription(page)` helper (front matter override → first-paragraph fallback). Extend `PageFrontmatter` with optional `description`.
  - `src/routes/__root.tsx` — sitewide `Course` JSON-LD.
  - `src/routes/index.tsx`, `src/routes/$.tsx` — per-page description/OG meta + `Article` + `BreadcrumbList` JSON-LD.
  - `src/lib/glossary.ts` — auto-link first occurrence per page; keep `%` as optional force.
  - `src/components/GlossaryList.tsx` — new styled, anchored definition list.
  - `src/components/PageLayout.tsx` (or MarkdownRenderer) — render `GlossaryList` and suppress the raw table on the glossary page.
  - `src/components/ui/hover-card.tsx` — add `Portal`.
- **No new dependencies.** `@radix-ui/react-hover-card` is already installed.
- **Verification:** check the console hydration warning is gone, confirm glossary terms auto-link on a page without `%`, confirm the glossary page renders the styled list, and inspect page source/head for unique descriptions + JSON-LD.

## Out of scope / unchanged

- No required front matter changes; the glossary table format is unchanged.
- No search, progress tracking, or new content blocks (can be follow-ups).
