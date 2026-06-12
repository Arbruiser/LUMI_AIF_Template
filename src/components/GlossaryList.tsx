import * as React from "react";
import { getGlossary } from "@/lib/glossary";

/** URL-/anchor-safe id derived from a term, e.g. "Front Matter" -> "front-matter". */
function termToId(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Styled, alphabetically sorted glossary rendered from the same markdown table
 * authors already edit. Each entry has a deep-linkable anchor (e.g.
 * `/glossary#markdown`).
 */
export function GlossaryList() {
  const entries = React.useMemo(
    () =>
      [...getGlossary().values()].sort((a, b) =>
        a.term.localeCompare(b.term, undefined, { sensitivity: "base" })
      ),
    []
  );

  if (entries.length === 0) return null;

  return (
    <dl className="mt-6 grid gap-3 not-prose">
      {entries.map((entry) => {
        const id = termToId(entry.term);
        return (
          <div
            key={entry.term}
            id={id}
            className="group scroll-mt-24 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:border-lumi-magenta/60"
          >
            <dt className="flex items-center gap-2 font-semibold text-foreground">
              <a
                href={`#${id}`}
                aria-label={`Link to ${entry.term}`}
                className="text-lumi-magenta opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                #
              </a>
              {entry.term}
            </dt>
            <dd className="mt-1 leading-relaxed text-muted-foreground">
              {entry.definition}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
