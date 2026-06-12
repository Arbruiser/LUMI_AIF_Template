## Goal

Let content creators define terms once in a `Glossary` page, then mark any word in their chapters with a simple `[[term]]` syntax. Readers see those words in a LUMI accent color with a dotted underline; hovering (or focusing) shows a small popover with the definition.

## How it will work for content creators

1. **One glossary page** — `content/glossary.md`, a normal page with a markdown table:

   ```markdown
   ---
   title: "Glossary"
   nav_order: 99
   ---

   | Term | Definition |
   |:-----|:-----------|
   | **Supercomputer** | A very powerful computing system made up of thousands of interconnected nodes working together. |
   | **Command Line** | A text-based interface where you type commands instead of clicking. |
   ```

2. **Marking a term anywhere** — wrap the word in double square brackets in any `.md` file:

   ```markdown
   Connect to the [[Supercomputer]] using the [[Command Line]].
   ```

   - Matching against the glossary table is **case-insensitive**, so `[[supercomputer]]` works too.
   - Optional alias for plurals/different wording: `[[supercomputers|Supercomputer]]` shows "supercomputers" but links to the "Supercomputer" definition.
   - If a term isn't found in the glossary, it renders as plain text (no broken-looking styling) and logs a dev warning.

3. **Appearance** — defined terms use the LUMI link color (`--link`, brand blue / brighter teal in dark mode) with a subtle dashed underline and a `help` cursor, turning LUMI magenta on hover — visible but not extreme, consistent with the existing link styling.

## Technical implementation

### New: `src/lib/glossary.ts`
- Imports the already-loaded `pages` from `content.ts`, finds the page with slug `glossary`, and parses its first markdown table into a `Map<lowercasedTerm, { term, definition }>` (skipping the header/separator rows, stripping `**`, `*`, backticks from cells).
- Exports a memoized `getGlossary()`.

### New: rehype plugin inside `MarkdownRenderer.tsx`
- A small `rehypeGlossary` plugin that visits text nodes, skips any inside `code`/`pre`/headings, and replaces `[[...]]` occurrences with a `span` element node carrying `className: ["glossary-term"]` and a `data-term` property. (Done at the hast level so it composes cleanly with the existing rehypeRaw/slug/highlight pipeline.)

### New: `GlossaryTerm` component (in `MarkdownRenderer.tsx` or its own file)
- Renders a Radix **HoverCard** (already in the project at `src/components/ui/hover-card.tsx`) — opens on hover and on keyboard focus.
- Looks up the term via `getGlossary()`. If missing → plain text. If present → the styled trigger + a popover showing the definition.

### Edit: `MarkdownRenderer.tsx`
- Add `rehypeGlossary` to the `rehypePlugins` array and add a `span` entry to `components` that detects the `glossary-term` class and renders `<GlossaryTerm>`.

### Edit: `src/styles.css`
- Add a `.glossary-term` rule (dashed underline, link color, `cursor: help`, magenta on hover) for light and dark mode.

### Content edits (examples for creators)
- Create `content/glossary.md` with the example terms you provided.
- Add a short "Glossary & term definitions" section to `content/index.md` documenting the `[[term]]` syntax, and show one live `[[Supercomputer]]` example in `content/chapter1.md`.

## Files

- `src/lib/glossary.ts` — new (parse glossary table)
- `src/components/MarkdownRenderer.tsx` — add rehype plugin, span mapping, GlossaryTerm
- `src/styles.css` — `.glossary-term` styling
- `content/glossary.md` — new example page
- `content/index.md` — document the syntax
- `content/chapter1.md` — one live example

## Notes / decisions
- Filename will be `glossary.md` (lowercase) so the URL is a clean `/glossary`; the sidebar/title still reads "Glossary".
- HoverCard works on hover + focus; on touch devices it opens on tap/focus of the term.
- No backend or build-config changes needed; everything runs in the existing markdown pipeline and prerenders fine.