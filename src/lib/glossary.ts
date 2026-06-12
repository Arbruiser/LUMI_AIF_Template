import { findPage } from "./content";

export interface GlossaryEntry {
  /** Canonical term as written in the glossary table. */
  term: string;
  /** Plain-text definition. */
  definition: string;
}

/** Strip the small set of inline markdown markers we expect in table cells. */
function stripInlineMarkdown(value: string): string {
  return value
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/__([^_]+)__/g, "$1") // bold (underscores)
    .replace(/_([^_]+)_/g, "$1") // italic (underscores)
    .trim();
}

/** Split a markdown table row into trimmed cell values. */
function parseRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return null;
  // Drop the leading/trailing pipe, then split on unescaped pipes.
  const inner = trimmed.replace(/^\|/, "").replace(/\|\s*$/, "");
  return inner.split("|").map((c) => c.trim());
}

/** A separator row looks like | :--- | :--- |. */
function isSeparatorRow(cells: string[]): boolean {
  return cells.every((c) => /^:?-{3,}:?$/.test(c.replace(/\s/g, "")));
}

let cache: Map<string, GlossaryEntry> | null = null;

/**
 * Parse the first two-column markdown table in the glossary page into a
 * case-insensitive lookup of term -> definition. Result is memoised.
 */
export function getGlossary(): Map<string, GlossaryEntry> {
  if (cache) return cache;

  const map = new Map<string, GlossaryEntry>();
  const page = findPage("glossary");
  if (!page) {
    cache = map;
    return map;
  }

  const lines = page.body.split(/\r?\n/);
  let seenSeparator = false;

  for (const line of lines) {
    const cells = parseRow(line);
    if (!cells || cells.length < 2) continue;

    if (isSeparatorRow(cells)) {
      seenSeparator = true;
      continue;
    }

    // Skip rows until we've passed the header separator, so the literal
    // "Term | Definition" header is never treated as an entry.
    if (!seenSeparator) continue;

    const term = stripInlineMarkdown(cells[0]);
    const definition = stripInlineMarkdown(cells[1]);
    if (!term || !definition) continue;

    map.set(term.toLowerCase(), { term, definition });
  }

  cache = map;
  return map;
}

/** Look up a definition by term (case-insensitive). */
export function lookupTerm(term: string): GlossaryEntry | undefined {
  return getGlossary().get(term.trim().toLowerCase());
}
