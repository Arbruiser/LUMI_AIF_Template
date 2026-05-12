import * as React from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

interface Props {
  items: TocItem[];
}

export function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const restoringHashRef = React.useRef(false);

  const scrollToId = React.useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    restoringHashRef.current = true;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
    const newHash = `#${id}`;
    if (window.location.hash !== newHash) {
      const url = window.location.pathname + window.location.search + newHash;
      const nativeReplaceState = Object.getPrototypeOf(window.history).replaceState;
      nativeReplaceState.call(window.history, window.history.state, "", url);
    }
    window.setTimeout(() => {
      restoringHashRef.current = false;
    }, 700);
  }, []);

  const handleLinkClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      scrollToId(id);
    },
    [scrollToId]
  );

  const replaceHash = React.useCallback((id: string) => {
    const newHash = `#${id}`;
    if (window.location.hash === newHash) return;
    const url = window.location.pathname + window.location.search + newHash;
    const nativeReplaceState = Object.getPrototypeOf(window.history).replaceState;
    nativeReplaceState.call(window.history, window.history.state, "", url);
  }, []);

  // On mount, if the URL has a hash, scroll to that heading once content is rendered.
  React.useEffect(() => {
    if (items.length === 0) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    // Defer to next frame so layout is settled.
    requestAnimationFrame(() => {
      restoringHashRef.current = true;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "auto" });
      requestAnimationFrame(() => {
        restoringHashRef.current = false;
      });
    });
  }, [items]);

  React.useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const computeActive = (shouldUpdateHash: boolean) => {
      const baseOffset = Math.min(window.innerHeight * 0.42, 360);
      const endOffset = Math.max(baseOffset, window.innerHeight - 120);
      const remainingScroll =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      const bottomRamp = Math.min(1, Math.max(0, (600 - remainingScroll) / 600));
      const easedRamp = bottomRamp * bottomRamp * (3 - 2 * bottomRamp);
      const activationLine =
        window.scrollY + baseOffset + (endOffset - baseOffset) * easedRamp;
      let current: string | null = null;
      for (const h of headings) {
        const top = h.getBoundingClientRect().top + window.scrollY;
        if (top <= activationLine) current = h.id;
        else break;
      }
      const nextActive = current ?? items[0].id;
      setActiveId(nextActive);
      if (shouldUpdateHash) replaceHash(nextActive);
    };

    const onScroll = () => {
      const shouldUpdateHash = !restoringHashRef.current;
      computeActive(shouldUpdateHash);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    computeActive(false);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [items, replaceHash]);

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
                onClick={(e) => handleLinkClick(e, item.id)}
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
