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

/** Longest glossary phrase that the preceding words can form. */
const MAX_TERM_WORDS = 6;

const HTML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) => HTML_ESCAPE[c]);
}

/**
 * Look back over the text rendered so far and return the longest run of
 * trailing words that exactly matches a glossary entry, or null.
 */
function matchPrecedingTerm(
  rendered: string,
  glossary: Map<string, GlossaryEntry>
): { phrase: string; entry: GlossaryEntry } | null {
  // Only consider the trailing text that isn't inside a previously
  // inserted HTML tag (stop at the last < or >).
  const tail = (rendered.match(/[^<>]*$/) || [""])[0];
  const tokens = [...tail.matchAll(/\S+/g)];
  for (let k = Math.min(MAX_TERM_WORDS, tokens.length); k >= 1; k--) {
    const start = tokens[tokens.length - k].index ?? 0;
    const phrase = tail.slice(start);
    const key = phrase.replace(/\s+/g, " ").trim().toLowerCase();
    const entry = glossary.get(key);
    if (entry) return { phrase, entry };
  }
  return null;
}

function processSegment(
  text: string,
  glossary: Map<string, GlossaryEntry>
): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "%") {
      out += ch;
      continue;
    }
    const prev = text[i - 1];
    const wordBefore = prev !== undefined && /[\p{L}\p{N})\]]/u.test(prev);
    if (wordBefore) {
      const match = matchPrecedingTerm(out, glossary);
      if (match) {
        out = out.slice(0, out.length - match.phrase.length);
        out += `<span class="glossary-term" data-term="${escapeHtml(
          match.entry.term
        )}">${escapeHtml(match.phrase)}</span>`;
        continue; // consume the percent-sign marker
      }
    }
    out += ch;
  }
  return out;
}

function processLine(
  line: string,
  glossary: Map<string, GlossaryEntry>
): string {
  // Leave inline code spans (`...`) untouched.
  const parts = line.split(/(`[^`]*`)/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) continue; // odd parts are code spans
    parts[i] = processSegment(parts[i], glossary);
  }
  return parts.join("");
}

/**
 * Convert `term%` markers in a markdown source into glossary `<span>` HTML.
 *
 * - Put a single percent sign directly after a term: `Supercomputer%`.
 * - Multi-word terms work too (`Front Matter%`) — the longest matching
 *   glossary phrase ending at the percent sign is used.
 * - Only words that exist in the glossary table are converted, so ordinary
 *   percent signs are left alone.
 * - Fenced code blocks and inline code spans are skipped.
 */
export function applyGlossaryMarkers(source: string): string {
  const glossary = getGlossary();
  if (glossary.size === 0) return source;

  const lines = source.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    lines[i] = processLine(lines[i], glossary);
  }
  return lines.join("\n");
}
