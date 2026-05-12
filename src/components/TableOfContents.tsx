import * as React from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

interface Props {
  items: TocItem[];
}

export function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const userScrolledRef = React.useRef(false);

  // On mount, if the URL has a hash, scroll to that heading once content is rendered.
  React.useEffect(() => {
    if (items.length === 0) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    // Defer to next frame so layout is settled.
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "auto" });
    });
  }, [items]);

  React.useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const computeActive = () => {
      const threshold = 100;
      let current: string | null = null;
      for (const h of headings) {
        const top = h.getBoundingClientRect().top;
        if (top - threshold <= 0) current = h.id;
        else break;
      }
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (nearBottom) current = items[items.length - 1].id;
      if (window.scrollY < 80) current = items[0].id;
      setActiveId(current ?? items[0].id);
    };

    const onScroll = () => {
      userScrolledRef.current = true;
      computeActive();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    computeActive();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  React.useEffect(() => {
    if (!activeId) return;
    // Don't write the hash until the user has actually scrolled — avoids
    // hijacking the URL on initial page load.
    if (!userScrolledRef.current) return;
    const newHash = `#${activeId}`;
    if (window.location.hash === newHash) return;
    const t = window.setTimeout(() => {
      const url = window.location.pathname + window.location.search + newHash;
      const native = Object.getPrototypeOf(window.history).replaceState;
      native.call(window.history, window.history.state, "", url);
    }, 120);
    return () => window.clearTimeout(t);
  }, [activeId]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto text-sm xl:block"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "-ml-px block border-l py-0.5 pl-3 transition-colors",
                  item.depth === 3 && "pl-6",
                  active
                    ? "border-lumi-magenta text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
