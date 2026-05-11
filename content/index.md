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

You can optionally label a code block with a filename — handy when the
snippet belongs to a specific script. Just add `title="..."` after the
language:

````md
```python title="train.py"
import torch
model = torch.nn.Linear(10, 1)
```
````

…which renders as:

```python title="train.py"
import torch
model = torch.nn.Linear(10, 1)
```

- **Terminal flair**: tag a code block with `bash`, `sh`, `shell`, or `zsh`
  and it will render as a styled terminal window — perfect for showing
  HPC commands students should run themselves:

```bash
module load LUMI/24.03
srun --account=project_465000001 --partition=small-g --pty bash
nvidia-smi
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

![LUMI data center facade from the LUMI brand guide](./assets/lumi-data-center.jpg)

For a captioned, resized image, use HTML directly inside your markdown:

<figure>
  <img src="./assets/lumi-data-center.jpg" style="width: 60%; margin: 0 auto; display: block;" />
  <figcaption><em>Figure 1: LUMI data center visual from the LUMI brand guide.</em></figcaption>
</figure>

---

## Embedding YouTube videos

Copy the **Embed code** from YouTube (Share → Embed) and paste the `<iframe>`
directly into your `.md` file. It will be rendered in a responsive 16:9
container automatically:

<iframe width="560" height="315" src="https://www.youtube.com/embed/aLae9Sd2oos?si=uJ_6ccR3ArrpVXqT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

---

## Putting it all together

> [!tip] Authoring workflow
> Keep each `.md` file focused on a single learning objective. Use callouts
> for the things students must not miss, and terminal code blocks for any
> commands they should actually run on LUMI.

> [!warning] Before you publish
> Double-check `nav_order` across all pages so the sidebar reads top-to-bottom
> in the order you teach. Mismatched ordering is the most common authoring
> mistake.
