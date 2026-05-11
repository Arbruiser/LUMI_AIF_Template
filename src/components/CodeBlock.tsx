import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: Set<number>;
}

const TERMINAL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console"]);

/** Wrap each newline-separated line of an already-highlighted code tree in a
 *  <span class="code-line"> so we can apply line numbers and per-line
 *  highlighting via CSS. Walks both text nodes and span children. */
function wrapLines(
  children: React.ReactNode,
  highlight?: Set<number>
): React.ReactNode {
  const lines: React.ReactNode[][] = [[]];
  const pushNode = (n: React.ReactNode) => lines[lines.length - 1].push(n);

  React.Children.forEach(children, (child) => {
    if (typeof child === "string") {
      const parts = child.split("\n");
      parts.forEach((p, i) => {
        if (p.length > 0) pushNode(p);
        if (i < parts.length - 1) lines.push([]);
      });
    } else {
      pushNode(child);
    }
  });

  // Drop a trailing empty line that markdown commonly appends.
  if (
    lines.length > 1 &&
    lines[lines.length - 1].length === 0
  ) {
    lines.pop();
  }

  return lines.map((parts, i) => (
    <span
      key={i}
      className={cn(
        "code-line",
        highlight?.has(i + 1) && "code-line-hl"
      )}
    >
      {parts.length > 0 ? parts : "\u200B"}
    </span>
  ));
}

export function CodeBlock({
  className,
  children,
  title,
  showLineNumbers,
  highlightLines,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const ref = React.useRef<HTMLPreElement>(null);

  const lang = className?.match(/language-(\w+)/)?.[1];
  const isTerminal = lang ? TERMINAL_LANGS.has(lang.toLowerCase()) : false;

  const onCopy = async () => {
    const text = ref.current?.innerText ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const wrapped = wrapLines(children, highlightLines);

  if (isTerminal) {
    return (
      <div className="terminal-block group relative my-5 overflow-hidden rounded-md border border-terminal-border shadow-md">
        <div className="terminal-chrome flex items-center justify-between px-3 py-1.5">
          <div className="w-16" />
          <span className="font-sans text-xs text-terminal-chrome-fg truncate">
            {title ?? "user@lumi: ~"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCopy}
              className="mr-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-terminal-chrome-fg/80 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100 focus:opacity-100"
              aria-label="Copy code"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="terminal-btn" aria-hidden>−</span>
            <span className="terminal-btn" aria-hidden>▢</span>
            <span className="terminal-btn terminal-btn-close" aria-hidden>×</span>
          </div>
        </div>
        <pre
          ref={ref}
          className={cn(
            "overflow-x-auto px-4 py-3 text-sm leading-relaxed text-terminal-fg bg-terminal-bg",
            showLineNumbers && "with-line-numbers"
          )}
        >
          <code className={className}>{wrapped}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative my-5 overflow-hidden rounded-lg border border-code-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-code-border px-4 py-2 text-xs">
        <span className="flex items-center gap-2 font-mono text-foreground/60">
          {title && (
            <span className="font-sans font-medium text-foreground/80">
              {title}
            </span>
          )}
          {title && lang && <span className="opacity-40">·</span>}
          <span>{lang ?? "text"}</span>
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-foreground/60 opacity-0 transition-opacity hover:bg-foreground/10 group-hover:opacity-100 focus:opacity-100"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        ref={ref}
        className={cn(
          "overflow-x-auto px-4 py-3 text-sm leading-relaxed",
          showLineNumbers && "with-line-numbers"
        )}
      >
        <code className={className}>{wrapped}</code>
      </pre>
    </div>
  );
}
