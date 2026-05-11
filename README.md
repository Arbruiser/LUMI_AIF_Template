# LUMI AI Factory — Branded Learning Template

This is a template for creating clean, branded self-learning course sites for the **LUMI AI Factory**. The site:

- has the LUMI AI Factory branding and colours;
- has light and dark mode (auto-follows the visitor's system, with a manual toggle);
- supports headings, lists, tables, code blocks with syntax highlighting and copy-to-clipboard, math (KaTeX), images, embedded videos, and four branded callout types;
- can be edited just by adding/editing `.md` files in the `content/` folder.

## Quick start

1. Click **Use this template** at the top of this repository to make your own copy. Name it after your course.
2. In your new repository, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Push any change to `main`. A green tick next to your commit means the site has built and deployed.
4. Click the gear icon ⚙ next to **About** on the right side of your repo, tick **Use your GitHub Pages website**, and click **Save**. The live link now appears at the top of the repo.
5. Edit `content/index.md` and add your content. To force-refresh and skip the cache, press `Ctrl + F5` (Linux/Windows) or `Cmd + Shift + R` (Mac).

Every push to `main` rebuilds and redeploys the site automatically.

## Adding pages

The home page is `content/index.md` — keep that filename. To add a new page or chapter, drop a new `.md` file into `content/` with this frontmatter at the top:

```yaml
---
title: "Chapter 1 — Getting Started"
nav_order: 2
---
```

To make a chapter with subchapters, add `has_children: true` on the parent and use `parent: "<exact parent title>"` on each child. See `content/chapter1.md` for a working example.

## Callouts

```markdown
> [!note] Optional title
> Purple — additional context.

> [!warning] Optional title
> Magenta — critical warnings.

> [!info] Optional title
> Blue — neutral side-notes.

> [!tip] Optional title
> Teal — pro-tips and best practices.

> [!command]
> srun --pty bash
```

## Fonts

The official LUMI brand font (Mr Eaves XL Mod OT) is licensed and not redistributable. The template ships with [Inter](https://rsms.me/inter/), a free open-source font with a similar geometric, humanist feel. If your team has a Mr Eaves licence you can drop the `.woff2` files in `public/fonts/` and update `--font-sans` in `src/styles.css`.
