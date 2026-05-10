import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import rehypeRaw from "rehype-raw";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
  source: string;
}

/** Vite injects the deployment base path (e.g. "/lumi-aif-creator-kit/" on
 *  GitHub Pages). Author-friendly relative paths like "./assets/foo.jpg" or
 *  "assets/foo.jpg" need to be resolved against it so they work in dev,
 *  preview, and on Pages without authors knowing about base URLs. */
function resolveAssetUrl(src: string | undefined): string | undefined {
  if (!src) return src;
  // Absolute URLs and already-absolute paths pass through unchanged.
  if (/^[a-z]+:\/\//i.test(src) || src.startsWith("//")) return src;
  if (src.startsWith("/")) return src;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const rel = src.replace(/^\.\//, "");
  return `${base}/${rel}`;
}

// Match `[!type] optional title` at the start of a paragraph. Use [^\n]* so
// the title doesn't gobble the rest of a multi-line paragraph (the body of the
// callout is the text after the first newline).
const CALLOUT_RE = /^\[!(note|warning|info|tip|command)\][ \t]*([^\n]*)/i;

type CalloutVariant = "note" | "warning" | "info" | "tip" | "command";

/** Detect GitHub-style `[!type] Title` in the first child of a blockquote. */
function extractCallout(
  children: React.ReactNode
): { variant: CalloutVariant; title?: string; rest: React.ReactNode } | null {
  const arr = React.Children.toArray(children);
  // Skip whitespace-only text nodes that markdown adds between blocks.
  const firstIdx = arr.findIndex(
    (c) => !(typeof c === "string" && c.trim() === "")
  );
  if (firstIdx === -1) return null;
  const first = arr[firstIdx];

  if (!React.isValidElement(first)) return null;
  const firstProps = first.props as { children?: React.ReactNode };
  const inner = React.Children.toArray(firstProps.children);
  if (inner.length === 0) return null;
  const head = inner[0];
  if (typeof head !== "string") return null;

  const match = head.match(CALLOUT_RE);
  if (!match) return null;

  const variant = match[1].toLowerCase() as CalloutVariant;
  const title = match[2].trim() || undefined;

  // Keep any text in the same paragraph that came AFTER the marker line
  // (e.g. `> [!note] Title` on line 1 and body text on line 2 — markdown
  // joins these into one paragraph separated by `\n`).
  const matchedLen = match[0].length;
  const remainderHead = head.slice(matchedLen).replace(/^\n+/, "");
  const restOfFirst: React.ReactNode[] = [
    ...(remainderHead ? [remainderHead] : []),
    ...inner.slice(1),
  ];
  const newFirst = React.cloneElement(
    first as React.ReactElement<{ children?: React.ReactNode }>,
    { children: restOfFirst }
  );
  const rest = [
    ...arr.slice(0, firstIdx),
    ...(restOfFirst.length > 0 ? [newFirst] : []),
    ...arr.slice(firstIdx + 1),
  ];

  return { variant, title, rest };
}

export function MarkdownRenderer({ source }: MarkdownRendererProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Delegated click on heading-anchor links: copy the deep-link to clipboard
  // instead of just scrolling. Falls back to default behavior on failure.
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a.heading-anchor");
      if (!target) return;
      const href = (target as HTMLAnchorElement).getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const url = window.location.origin + window.location.pathname + href;
      if (navigator.clipboard) {
        e.preventDefault();
        navigator.clipboard.writeText(url).catch(() => {});
        // Still update the URL hash so the page scrolls to the heading.
        window.history.replaceState(null, "", href);
        document.getElementById(href.slice(1))?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="prose-lumi" ref={containerRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: "heading-anchor",
                ariaLabel: "Link to this section",
              },
              content: { type: "text", value: "" },
            },
          ],
          rehypeHighlight,
          rehypeKatex,
        ]}
        components={{
          blockquote({ children }) {
            const callout = extractCallout(children);
            if (callout) {
              return (
                <Callout variant={callout.variant} title={callout.title}>
                  {callout.rest}
                </Callout>
              );
            }
            return (
              <blockquote className="my-5 border-l-4 border-border pl-4 italic text-foreground/80">
                {children}
              </blockquote>
            );
          },
          pre({ children }) {
            // We render <pre> via CodeBlock from the inner <code>.
            const child = React.Children.only(
              children
            ) as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
            return (
              <CodeBlock className={child.props.className}>
                {child.props.children}
              </CodeBlock>
            );
          },
          code({ className, children }) {
            // Inline code (no className) — block code is handled by `pre`.
            if (!className) {
              return (
                <code className="rounded bg-inline-code-bg px-1.5 py-0.5 font-mono text-[0.9em] text-inline-code-fg">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          a({ href, children }) {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                className="text-link underline-offset-2 hover:text-lumi-magenta hover:underline"
              >
                {children}
              </a>
            );
          },
          img({ src, alt, ...rest }) {
            return <img src={resolveAssetUrl(src)} alt={alt ?? ""} {...rest} />;
          },
          iframe(props) {
            const src = resolveAssetUrl(props.src);
            return (
              <div className="my-6 aspect-video w-full overflow-hidden rounded-lg border border-border">
                <iframe
                  {...props}
                  src={src}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
