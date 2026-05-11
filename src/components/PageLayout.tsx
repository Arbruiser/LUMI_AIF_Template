import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { TableOfContents } from "./TableOfContents";
import { extractToc } from "@/lib/toc";
import { getBreadcrumbs, getPrevNext, type Page } from "@/lib/content";


interface Props {
  page: Page;
}

export function PageLayout({ page }: Props) {
  const toc = React.useMemo(() => extractToc(page.body), [page.body]);
  const breadcrumbs = React.useMemo(
    () => getBreadcrumbs(page.slug),
    [page.slug]
  );
  const { prev, next } = React.useMemo(
    () => getPrevNext(page.slug),
    [page.slug]
  );

  return (
    <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0 mx-auto w-full max-w-[78ch] xl:mx-0 xl:max-w-none">
        {breadcrumbs.length > 1 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              const href = crumb.slug === "" ? "/" : `/${crumb.slug}`;
              return (
                <React.Fragment key={crumb.slug}>
                  {i > 0 && <span className="opacity-60">/</span>}
                  {isLast ? (
                    <span className="text-foreground/80">
                      {crumb.frontmatter.title}
                    </span>
                  ) : (
                    <Link
                      to={href}
                      className="hover:text-lumi-magenta hover:underline"
                    >
                      {crumb.frontmatter.title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <MarkdownRenderer source={page.body} />

        {(prev || next) && (
          <nav
            aria-label="Page navigation"
            className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                to={prev.slug === "" ? "/" : `/${prev.slug}`}
                className="group flex flex-col rounded-lg border border-border p-4 text-left transition-colors hover:border-lumi-magenta"
              >
                <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </span>
                <span className="mt-1 font-medium text-foreground group-hover:text-lumi-magenta">
                  {prev.frontmatter.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={next.slug === "" ? "/" : `/${next.slug}`}
                className="group flex flex-col rounded-lg border border-border p-4 text-right transition-colors hover:border-lumi-magenta sm:col-start-2"
              >
                <span className="flex items-center justify-end gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1 font-medium text-foreground group-hover:text-lumi-magenta">
                  {next.frontmatter.title}
                </span>
              </Link>
            ) : null}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block">
        <TableOfContents items={toc} />
      </aside>
    </div>
  );
}
