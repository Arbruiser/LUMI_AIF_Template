---
title: "Home"
nav_order: 1
---

# LUMI AIF Learning Template

This is the official template for creating clean, branded self-learning course
sites. By using this template, you ensure that your training materials match
the **LUMI AI Factory** visual identity automatically.

For a quick overview of the Markdown syntax, see the
[Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/).

---

## Add more pages

1. **Create a new page.** `content/index.md` is the landing page of the
   website — do not rename it. You can add more pages by dropping new `.md`
   files into `content/` (or a subfolder). To remove the example chapter,
   delete `content/chapter1.md`.
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
- `parent` (optional) groups a page underneath a chapter — see
  `content/chapter1.md` for an example.

---

## Branded callouts

Use callout boxes to highlight information for your students. Just start a
blockquote with `[!type]` and optionally a custom title:

> [!note] LUMI Purple — Note
> Use this for additional context or general helpful information.

> [!warning] LUMI Magenta — Warning
> Use this for critical warnings, security notices, or common errors to avoid.

> [!info] LUMI Blue — Info
> Use this for neutral side-notes, references, or background information.

> [!tip] LUMI Teal — Tip
> Use this for pro-tips, shortcuts, or recommended best practices.

The `command` callout renders a single copyable terminal command — perfect
for one-liner HPC instructions:

> [!command]
> srun --pty bash

Make sure to leave an empty line before and after each callout.

---

## Technical content

- **Links** turn magenta on hover.
- **Inline commands**: use backticks to show code like `srun --pty bash`.
- **Code blocks**: triple backticks render syntax-highlighted blocks with a
  copy button in the top-right corner. Always leave an empty line before and
  after the block:

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

- **Terminal blocks**: tag a code block with `bash`, `sh`, `shell`, or `zsh`
  and it renders as a styled terminal window with a `user@lumi:~$` prompt
  on every line. The copy button only copies the actual commands — not the
  prompt — so students can paste straight into their shell:

```bash
module load LUMI/24.03
srun --account=project_465000001 --partition=small-g --pty bash
nvidia-smi
```

---

## Embedding pictures

Drop your image in the `public/assets/` folder of the repository, then
reference it from any `.md` file using the `./assets/...` form — the
template resolves it correctly in dev, in preview, and on GitHub Pages.
Click an image to open it full-size in a lightbox.

![LUMI data center facade from the LUMI brand guide](./assets/lumi-data-center.jpg)

For a captioned, resized image, use HTML directly inside your markdown.
Use viewport-relative widths (`vw`) so the image actually scales down on
larger screens:

<figure>
  <img src="./assets/lumi-data-center.jpg" alt="LUMI data center visual from the LUMI brand guide" style="width: 40vw; max-width: 100%; margin: 0 auto; display: block;" />
  <figcaption><em>Figure 1: LUMI data center visual from the LUMI brand guide.</em></figcaption>
</figure>

---

## Embedding YouTube videos

Copy the **Embed code** from YouTube (Share → Embed) and paste the `<iframe>`
directly into your `.md` file. It is rendered in a responsive 16:9
container automatically:

<iframe width="560" height="315" src="https://www.youtube.com/embed/aLae9Sd2oos?si=uJ_6ccR3ArrpVXqT" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

---

## Tables

GitHub-flavored Markdown tables render with LUMI styling out of the box.
Always leave an empty line before and after the table:

| Nodes | CPUs             | CPU cores  | Memory   |
|:------|:-----------------|:-----------|:---------|
| 1888  | 2x AMD EPYC 7763 | 128 (2x64) | 256 GiB  |
| 128   | 2x AMD EPYC 7763 | 128 (2x64) | 512 GiB  |
| 32    | 2x AMD EPYC 7763 | 128 (2x64) | 1024 GiB |

---

## Mathematical formulas

Write LaTeX formulas using KaTeX. Use single dollar signs for inline math
and double dollar signs for block math.

- **Inline math:** $E = mc^2$
- **Block math:**

$$
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
$$

$$
\int_{-\infty}^{\infty} e^{-x^2}\, dx = \sqrt{\pi}
$$

---

## Section links and table of contents

Every heading on the page automatically gets a copy-link icon next to it on
hover — clicking it copies a deep link to that section to your clipboard.
The table of contents on the right tracks your scroll position and updates
the URL hash live, so the link you share always points to whatever the
reader is currently looking at.

---

## Putting it all together

> [!tip] Authoring workflow
> Keep each `.md` file focused on a single learning objective. Use callouts
> for the things students must not miss, and terminal code blocks for any
> commands they should actually run on LUMI.

> [!warning] Before you publish
> Double-check `nav_order` across all pages so the sidebar reads
> top-to-bottom in the order you teach. Mismatched ordering is the most
> common authoring mistake.

---

## Need help?

If you have questions or suggestions on how to improve the template, please
reach out on RocketChat: **Artúr Vojt-Antal**.
