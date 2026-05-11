import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";

import rehypeRaw from "rehype-raw";

const linkIconSvg = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  { fragment: true }
).children;
import { toast } from "sonner";
import { visit } from "unist-util-visit";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

/** Hoist `data.meta` from <code> onto its parent <pre> so it survives the
 *  hast→React boundary and is reachable via JSX props. */
function rehypeHoistCodeMeta() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: { tagName?: string; properties?: Record<string, unknown>; children?: Array<{ tagName?: string; data?: { meta?: string } }> }) => {
      if (
        node.tagName === "pre" &&
        node.children?.[0]?.tagName === "code" &&
        node.children[0].data?.meta
      ) {
        node.properties = node.properties ?? {};
        (node.properties as Record<string, unknown>).dataMeta =
          node.children[0].data.meta;
      }
    });
  };
}

function rehypeCopyHeadingButtons() {
  return (tree: unknown) => {
    visit(
      tree as never,
      "element",
      (node: {
        tagName?: string;
        properties?: Record<string, unknown>;
        children?: unknown[];
      }) => {
        if (!/^h[1-4]$/.test(node.tagName ?? "")) return;
        const id = node.properties?.id;
        if (typeof id !== "string") return;
        node.children = node.children ?? [];
        node.children.push({
          type: "element",
          tagName: "button",
          properties: {
            type: "button",
            className: ["heading-anchor"],
            ariaLabel: "Copy link to this section",
            dataHref: `#${id}`,
          },
          children: linkIconSvg,
        });
      }
    );
  };
}

interface MarkdownRendererProps {
  source: string;
}

function resolveAssetUrl(src: string | undefined): string | undefined {
  if (!src) return src;
  if (/^[a-z]+:\/\//i.test(src) || src.startsWith("//")) return src;
  if (src.startsWith("/")) return src;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const rel = src.replace(/^\.\//, "");
  return `${base}/${rel}`;
}

const CALLOUT_RE = /^\[!(note|warning|info|tip|command)\][ \t]*([^\n]*)/i;

type CalloutVariant = "note" | "warning" | "info" | "tip" | "command";

function extractCallout(
  children: React.ReactNode
): { variant: CalloutVariant; title?: string; rest: React.ReactNode } | null {
  const arr = React.Children.toArray(children);
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

/** Parse a code-fence info string like:
 *    title="train.py" {1,3-5} showLineNumbers
 *  into { title, highlightLines, showLineNumbers }. */
function parseCodeMeta(meta?: string): {
  title?: string;
  highlightLines?: Set<number>;
  showLineNumbers?: boolean;
} {
  if (!meta) return {};
  const out: ReturnType<typeof parseCodeMeta> = {};
  const titleMatch = meta.match(/title=(?:"([^"]+)"|'([^']+)'|(\S+))/);
  if (titleMatch) out.title = titleMatch[1] ?? titleMatch[2] ?? titleMatch[3];
  if (/(?:^|\s)showLineNumbers(?:\s|$)/.test(meta)) out.showLineNumbers = true;
  const range = meta.match(/\{([\d,\s-]+)\}/);
  if (range) {
    const set = new Set<number>();
    for (const part of range[1].split(",")) {
      const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!m) continue;
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : start;
      for (let i = start; i <= end; i++) set.add(i);
    }
    if (set.size) out.highlightLines = set;
  }
  return out;
}

export function MarkdownRenderer({ source }: MarkdownRendererProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = React.useState<{
    src: string;
    alt: string;
  } | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("button.heading-anchor");
      if (!target) return;
      e.preventDefault();
      const href = (target as HTMLButtonElement).dataset.href;
      if (!href || !href.startsWith("#")) return;
      const url = window.location.origin + window.location.pathname + href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(() => {});
        toast.success("Link copied to clipboard");
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
          rehypeHoistCodeMeta,
          rehypeRaw,
          rehypeSlug,
          rehypeCopyHeadingButtons,
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
          pre(props) {
            const { children } = props;
            const p = props as Record<string, unknown>;
            const node = p.node as
              | {
                  children?: Array<{
                    tagName?: string;
                    data?: { meta?: string };
                  }>;
                }
              | undefined;
            const dataMeta =
              (p.dataMeta as string | undefined) ??
              (p["data-meta"] as string | undefined) ??
              node?.children?.find((child) => child.tagName === "code")?.data
                ?.meta;
            const child = React.Children.only(
              children
            ) as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
            const parsed = parseCodeMeta(dataMeta);
            return (
              <CodeBlock
                className={child.props.className}
                title={parsed.title}
                showLineNumbers={parsed.showLineNumbers}
                highlightLines={parsed.highlightLines}
              >
                {child.props.children}
              </CodeBlock>
            );
          },
          code({ className, children }) {
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
          img(props) {
            const { src, alt, style, width, height, className } =
              props as React.ImgHTMLAttributes<HTMLImageElement>;
            const resolved = resolveAssetUrl(src) ?? "";
            const altText = alt ?? "";
            return (
              <button
                type="button"
                onClick={() => setLightbox({ src: resolved, alt: altText })}
                className="cursor-zoom-in border-0 bg-transparent p-0 max-w-full mx-auto"
                style={{ display: "block", marginTop: "1.25rem", marginBottom: "1.25rem" }}
                aria-label={altText ? `Open image: ${altText}` : "Open image"}
              >
                <img
                  src={resolved}
                  alt={altText}
                  style={style}
                  width={width}
                  height={height}
                  className={className}
                />
              </button>
            );
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

      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => !open && setLightbox(null)}
      >
        <DialogContent
          className="max-w-[95vw] border-0 bg-transparent p-0 shadow-none sm:max-w-[90vw]"
        >
          <VisuallyHidden>
            <DialogTitle>{lightbox?.alt || "Image preview"}</DialogTitle>
          </VisuallyHidden>
          {lightbox && (
            <figure className="flex flex-col items-center">
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
              {lightbox.alt && (
                <figcaption className="mt-3 text-center text-sm text-white/90">
                  {lightbox.alt}
                </figcaption>
              )}
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
