---
title: "Home"
nav_order: 1
---

# LUMI AIF Learning Template

Welcome! This is the official template for creating clean, branded self-learning
course sites for the **LUMI AI Factory**. Just edit the `.md` files in
`content/` and your site will rebuild automatically.

For a refresher on Markdown syntax, see the
[Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/).

---

## Add more pages

1. **Create a new page.** `content/index.md` is the landing page — keep that
   filename. Add new pages by dropping a `.md` file in `content/`. To remove
   the example chapter page, delete `content/chapter1.md`.
2. **Add front matter.** Every page needs these lines at the top:

```yaml
---
title: "Home"
nav_order: 1
---
```

Where:
- `title` is the name shown in the sidebar and the browser tab.
- `nav_order` controls the order pages appear in the sidebar.
- `parent` (optional) groups a page underneath a chapter — see `chapter1.md`.

---

## Branded callouts

Use callouts to highlight information for your students. Just start a
blockquote with `[!type]`:

> [!note] LUMI Purple — Note
> Use this for additional context or general helpful information.

> [!warning] LUMI Magenta — Warning
> Use this for critical warnings, security notices, or common errors to avoid.

> [!info] LUMI Blue — Info
> Use this for neutral side-notes, references, or background information.

> [!tip] LUMI Teal — Tip
> Use this for pro-tips, shortcuts, or recommended best practices.

> [!command]
> srun --pty bash

The `command` callout renders a copyable terminal command — perfect for
HPC instructions.

---

## Technical content

- **Links** turn magenta on hover.
- **Inline commands**: use backticks to show code like `srun --pty bash`.
- **Code blocks**: triple backticks render syntax-highlighted blocks with a
  copy button. Always leave an empty line before and after the block:

```python
import math

result = math.sqrt(25)
print(f"The calculation result is: {result}")
```

- **Math**: write inline math like $E = mc^2$ or block math:

$$
\int_{-\infty}^{\infty} e^{-x^2}\, dx = \sqrt{\pi}
$$

---

## Embedding pictures

Drop your image in the `public/assets/` folder of the repository, then
reference it from any `.md` file. Use the `./assets/...` form — the template
resolves it correctly in dev, in preview, and on GitHub Pages.

![LUMI AI Factory sample banner](./assets/lumi-sample.jpg)

For a captioned, resized image, use HTML directly inside your markdown:

<figure>
  <img src="./assets/lumi-sample.jpg" style="width: 60%; margin: 0 auto; display: block;" />
  <figcaption><em>Figure 1: A LUMI AI Factory sample banner.</em></figcaption>
</figure>

---

## Embedding YouTube videos

Copy the **Embed code** from YouTube (Share → Embed) and paste the `<iframe>`
directly into your `.md` file. It will be rendered in a responsive 16:9
container automatically:

<iframe src="https://www.youtube.com/embed/F4QrxLgjL-c" title="LUMI supercomputer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

