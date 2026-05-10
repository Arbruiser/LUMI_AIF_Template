---
title: "Chapter 1 — Getting Started with LUMI"
nav_order: 2
---

# Chapter 1 — Getting Started with LUMI

This is an example of an extra page. Use chapters like this to add structure
and split your materials into modules instead of a single long page.

You can even **add subchapters** by creating another `.md` file (e.g.
`chapter1-1.md`) and using the `parent` field. Update this file's frontmatter
to mark it as a parent:

```yaml
---
title: "Chapter 1 — Getting Started with LUMI"
nav_order: 2
has_children: true
---
```

…and the new subchapter's frontmatter as:

```yaml
---
title: "Authentication & Environment"
parent: "Chapter 1 — Getting Started with LUMI"
nav_order: 1
---
```

The `parent` value must match the parent page's `title` exactly.

> [!tip]
> All `.md` files in `content/` (except `index.md`) can be named anything
> you like. The URL is derived from the filename.

> [!warning]
> Don't rename `index.md` — it's the home page of the site.
