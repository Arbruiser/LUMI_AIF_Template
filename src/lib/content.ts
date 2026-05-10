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
