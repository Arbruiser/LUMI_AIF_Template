import matter from "gray-matter";
// Buffer polyfill needed by gray-matter in browser builds.
import { Buffer } from "buffer";
if (typeof globalThis !== "undefined" && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

export interface PageFrontmatter {
  title: string;
  nav_order?: number;
  parent?: string;
  has_children?: boolean;
}

export interface Page {
  /** URL slug — "" for index, otherwise filename without extension. */
  slug: string;
  /** Filesystem-style path used for "edit on GitHub". */
  path: string;
  frontmatter: PageFrontmatter;
  body: string;
}

const rawModules = import.meta.glob("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function fileToSlug(filePath: string): string {
  // "/content/index.md" -> ""
  // "/content/chapter1.md" -> "chapter1"
  // "/content/sub/page.md" -> "sub/page"
  const rel = filePath.replace(/^\/content\//, "").replace(/\.md$/, "");
  return rel === "index" ? "" : rel;
}

export const pages: Page[] = Object.entries(rawModules)
  .map(([filePath, raw]) => {
    const parsed = matter(raw);
    return {
      slug: fileToSlug(filePath),
      path: filePath.replace(/^\//, ""),
      frontmatter: parsed.data as PageFrontmatter,
      body: parsed.content,
    };
  })
  .sort(
    (a, b) =>
      (a.frontmatter.nav_order ?? 999) - (b.frontmatter.nav_order ?? 999)
  );

export function findPage(slug: string): Page | undefined {
  return pages.find((p) => p.slug === slug);
}

/** Linear list of pages in sidebar order — used for prev/next navigation. */
export function flattenNavOrder(): Page[] {
  const tree = buildNavTree();
  const out: Page[] = [];
  const walk = (nodes: NavNode[]) => {
    for (const n of nodes) {
      out.push(n.page);
      walk(n.children);
    }
  };
  walk(tree);
  return out;
}

export interface PrevNext {
  prev?: Page;
  next?: Page;
}

export function getPrevNext(slug: string): PrevNext {
  const flat = flattenNavOrder();
  const idx = flat.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

/** Build "Home › Chapter › Page" trail from front-matter parent links. */
export function getBreadcrumbs(slug: string): Page[] {
  const page = findPage(slug);
  if (!page) return [];
  const trail: Page[] = [page];
  let current = page;
  const byTitle = new Map(pages.map((p) => [p.frontmatter.title, p]));
  while (current.frontmatter.parent) {
    const parent = byTitle.get(current.frontmatter.parent);
    if (!parent || trail.includes(parent)) break;
    trail.unshift(parent);
    current = parent;
  }
  // Always start from Home unless we're already on it.
  const home = findPage("");
  if (home && trail[0].slug !== "") trail.unshift(home);
  return trail;
}

export interface NavNode {
  page: Page;
  children: NavNode[];
}

export function buildNavTree(): NavNode[] {
  const byTitle = new Map<string, NavNode>();
  const roots: NavNode[] = [];

  for (const page of pages) {
    const node: NavNode = { page, children: [] };
    byTitle.set(page.frontmatter.title, node);
  }

  for (const node of byTitle.values()) {
    const parentTitle = node.page.frontmatter.parent;
    if (parentTitle && byTitle.has(parentTitle)) {
      byTitle.get(parentTitle)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortChildren = (nodes: NavNode[]) => {
    nodes.sort(
      (a, b) =>
        (a.page.frontmatter.nav_order ?? 999) -
        (b.page.frontmatter.nav_order ?? 999)
    );
    nodes.forEach((n) => sortChildren(n.children));
  };
  sortChildren(roots);

  return roots;
}
