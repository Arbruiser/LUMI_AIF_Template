---
title: "Glossary"
nav_order: 99
---

# Glossary

This page is just a normal `.md` file in the `content/` folder, but it **must be named exactly `glossary.md`** (all lowercase). It needs the same front matter as any other page (`title` and `nav_order`). The first two-column markdown table below is automatically turned into the glossary — every term in the **Term** column can then be referenced from any page by putting a single **percent sign** directly after the word. The reader sees a dashed underline and gets the definition in a small pop-up when they hover over it (or focus it with the keyboard).

> [!tip] How to reference a term
> In any `.md` file, type the term and add a percent sign right after it, with no
> space in between: `Supercomputer%`. Matching is **case-insensitive**, so
> `supercomputer%` works too. Multi-word terms work as well — just put the
> percent sign after the last word: `Front Matter%`.

To add a term, just add a row to the table below. Keep the two columns **Term**
and **Definition**. Only words that appear in this table become links; every
other percent sign in your text is left untouched.

## Template terms

| Term | Definition |
|:-----|:-----------|
| **Markdown** | A lightweight plain-text formatting syntax used to write all the content in this template. |
| **Front Matter** | The block of metadata at the very top of a page, between the `---` lines, that sets the page title and sidebar order. |
| **Callout** | A coloured box used to highlight a note, warning, info side-note, tip, or copyable command for your students. |

