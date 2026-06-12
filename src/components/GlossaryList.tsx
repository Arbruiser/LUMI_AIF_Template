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
    <div className="prose-lumi mt-6">
      <dl className="w-full divide-y divide-border rounded-lg border border-border not-prose">
      {entries.map((entry) => {
        const id = termToId(entry.term);
        return (
          <div
            key={entry.term}
            id={id}
            className="group scroll-mt-24 grid grid-cols-1 gap-1 px-4 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="flex items-baseline gap-1.5 font-semibold text-foreground">
              <a
                href={`#${id}`}
                aria-label={`Link to ${entry.term}`}
                className="text-lumi-magenta opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                #
              </a>
              <span>{entry.term}</span>
            </dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">
              {entry.definition}
            </dd>
          </div>
        );
      })}
      </dl>
    </div>
  );
}
