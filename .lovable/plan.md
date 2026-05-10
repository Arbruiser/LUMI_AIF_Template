Here are concrete, high-impact improvements grouped by priority. Pick any combination and I'll implement.

## Authoring experience (biggest wins)

1. **In-page table of contents.** Auto-generate a sticky right-hand TOC from the page's H2/H3 headings, with active-section highlight on scroll. Long chapters become much easier to navigate.
2. **Prev / Next page navigation.** Buttons at the bottom of every page that follow `nav_order`, so students read sequentially without going back to the sidebar.
3. **"Edit this page on GitHub" link.** `site.config.ts` already has `githubRepo` — wire it into the footer so contributors can fix typos in one click.
4. **Search.** Client-side fuzzy search (e.g. `flexsearch` or `fuse.js`) over all markdown content, keyboard-shortcut `/` to focus, results grouped by page.
5. **Reading progress + estimated reading time.** Small "8 min read" label under each H1, plus a thin magenta progress bar at the top of the page on scroll.

## Content & callouts

6. **More callout variants** authors keep asking for: `[!example]`, `[!exercise]`, `[!solution]` (collapsible), `[!quote]`. Same syntax, just more colours from the LUMI palette.
7. **Collapsible sections** via `<details>` styled with brand colours — useful for "Show solution" or long terminal output.
8. **Code block enhancements**: filename label above the block (` ```python title="train.py" `), line numbers, and line-range highlighting.
9. **Footnotes and definition lists** — already supported by `remark-gfm` for footnotes; just needs styling.

## Structure & navigation

10. **Multi-level chapter grouping.** Today the sidebar supports 1 level of nesting. Add support for `chapter1/lesson1.md` style folders so larger courses can group lessons under modules.
11. **Breadcrumbs** above the H1 (Home › Chapter 1 › Lesson 2).
12. **404 page** with a search box and links to the top chapters instead of a generic "page not found".

## Polish

13. **Better typography.** Drop-cap on the first paragraph of each chapter, tighter heading rhythm, larger line-height for body copy on wide screens.
14. **Image lightbox.** Click any markdown image to open it full-screen with caption.
15. **Print stylesheet.** A clean `@media print` so students can save chapters as PDF without sidebar/header chrome.
16. **Copy-link-to-heading.** Hover icon next to each H2/H3 that copies the deep-link to clipboard.
17. **Mobile polish.** The sidebar already collapses, but the header logo and theme toggle could use tighter spacing on <380px screens.

## Author tooling

18. **`content/_template.md`** — a starter file authors can copy when adding a new page, with the front-matter and a few example blocks pre-filled.
19. **README rewrite.** A short "How to add a chapter in 60 seconds" section aimed at non-developers.
20. **PR preview deploys.** Add a GitHub Action that comments a Pages preview URL on every PR so authors can review their writing before merging.

## SEO & sharing

21. **Per-page OG images.** Auto-generate a branded share card (LUMI logo + page title on magenta background) at build time using `satori`. Right now every page shares the same generic preview.
22. **`sitemap.xml` and `robots.txt`** generated at build time from the markdown files.
23. **JSON-LD `Article` schema** on each page using the front-matter title and description.

---

## Suggested first batch (if you want a single round)

The combination that gives the best perceived upgrade in one go:
**1 (TOC) + 2 (Prev/Next) + 3 (Edit on GitHub) + 11 (Breadcrumbs) + 16 (heading anchor copy)** — all navigation/orientation features, all touch the same `MarkdownRenderer` + route layout, and together they make the site feel like a real documentation product (think Docusaurus / Mintlify) without changing how authors write markdown.

Tell me which numbers you want and I'll implement.
