import * as React from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

const TERMINAL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console"]);

/**
 * Renders a <pre><code> block with a copy button. The `className` from
 * react-markdown carries the language token (e.g. "language-python") which
 * rehype-highlight has already applied as syntax-highlighting spans.
 *
 * Shell-family languages get a dedicated terminal-window treatment with
 * traffic-light dots and a `$` prompt for extra flair.
 */
export function CodeBlock({ className, children }: CodeBlockProps) {
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

  if (isTerminal) {
    return (
      <div className="terminal-block group relative my-5 overflow-hidden rounded-md border border-terminal-border shadow-md">
        <div className="terminal-chrome flex items-center justify-between px-3 py-1.5">
          <div className="w-16" />
          <span className="font-sans text-xs text-terminal-chrome-fg truncate">
            user@lumi: ~
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
          className="overflow-x-auto px-4 py-3 text-sm leading-relaxed text-terminal-fg bg-terminal-bg"
        >
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative my-5 overflow-hidden rounded-lg border border-code-border bg-code-bg">
      <div className="flex items-center justify-between border-b border-code-border px-4 py-2 text-xs">
        <span className="font-mono text-foreground/60">{lang ?? "text"}</span>
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
        className="overflow-x-auto px-4 py-3 text-sm leading-relaxed"
      >
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
