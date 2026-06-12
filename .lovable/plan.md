# Glossary marker → `%`, and clean up `---` rules

## 1. Change the marker from `*` to `%`

Content creators will mark a glossary term by typing the term followed immediately by a percent sign, no space: `Markdown%`. Multi-word terms put the `%` after the last word: `Front Matter%`. Matching stays case-insensitive, and only words that exist in the glossary table are converted — every other `%` in the text is left untouched.

`%` is a better fit than `*` because it never overlaps with bold (`**`), italic (`*`), list bullets, or math.

### Code change — `src/lib/glossary.ts`
- In `processSegment`, detect `%` instead of `*` as the trigger character.
- Drop the now-unneeded bold-delimiter check (`isBoldDelim`) that only existed to avoid clashing with `**`/`*...*`.
- Keep the rest of the logic identical: still require a word/number/closing bracket immediately before the marker, still look back for the longest matching glossary phrase, still skip fenced code blocks and inline code spans.
- Update the doc comment on `applyGlossaryMarkers` to describe the `%` syntax.

## 2. Update the docs and examples

### `content/glossary.md`
- Rewrite the "How to reference a term" tip and the intro/closing text to say "percent sign" and show `Supercomputer%` / `Front Matter%` instead of the asterisk versions.

### `content/index.md`
- In the "Glossary & hover definitions" section, change `Markdown*`, `Front Matter*`, `Callout*`, and `markdown*` to their `%` equivalents, and reword the instruction lines to reference `%` instead of asterisks.

### `content/chapter1.md`
- Change `Markdown*` and `Front Matter*` to `Markdown%` and `Front Matter%`.

## 3. Remove the `---` horizontal rules from `index.md`

Delete the standalone horizontal-rule separator lines (currently at lines 12, 31, 56, 90, 107, 115, 131, 148, 155, 175), tidying the surrounding blank lines so sections still have clean spacing.

Explicitly kept:
- The front-matter block at the top (the first `---` / `---` pair) — required for the page to work.
- Any `---` that appears *inside* a fenced code block (those are front-matter examples being demonstrated, not real separators).

`chapter1.md` has no horizontal-rule separators (only front matter and code-block examples), so nothing is removed there.

## Verification
After the edits, load the home, chapter 1, and glossary pages in the preview to confirm the `%`-marked terms render with the dashed underline + hover definition, and that the `---` separators are gone from the home page while front matter and code examples remain intact.