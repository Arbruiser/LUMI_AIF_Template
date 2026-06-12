# Interactive Quizzes

Add a quiz feature so content creators can write multiple-choice questions in Markdown, and readers get a branded LUMI box where they pick answers, see immediate correct/incorrect feedback (with the right answer revealed), read an optional explanation, and click **Next question** to move through the set.

## How authors write a quiz

A quiz is a fenced code block tagged `quiz`. One block = one box that can hold several questions, separated by a line of `---`. The correct answer(s) use Markdown task-list checkboxes (`[x]` correct, `[ ]` wrong). An optional explanation line starts with `>`.

````text
```quiz
title: Check your understanding

Q: Which scheduler does LUMI use?
- [ ] PBS
- [x] Slurm
- [ ] LSF
> LUMI uses the Slurm workload manager for all batch jobs.

---

Q: Which of these are valid Slurm partitions? (select all)
- [x] standard-g
- [x] small-g
- [ ] turbo-x
> standard-g and small-g exist; turbo-x is made up.
```
````

Rules:
- `title:` (optional) shows as the box header; defaults to "Quiz".
- Each question begins with `Q:`.
- A question with exactly one `[x]` is single-choice: clicking an option reveals feedback immediately.
- A question with more than one `[x]` is "select all that apply": the reader toggles options, then clicks **Check answer**.
- After answering, correct option(s) are highlighted green, the reader's wrong pick is marked, the optional explanation appears, and a **Next question** button advances. On the last question a short **score summary** (e.g. "4 / 5 correct") and a **Restart quiz** button appear.

## Reader experience

- Branded card in LUMI colours (rounded border, accent bar like callouts) with a header showing the title and progress ("Question 2 of 5").
- Options are large clickable rows. Before answering: hover highlight. After answering: correct rows turn teal/green-tinted, an incorrectly chosen row turns magenta-tinted, a check/cross icon appears.
- Options are locked once answered (no changing the pick). Keyboard accessible (options are buttons; multi-select uses checkboxes + a submit button).
- State is per-block and in-memory only (resets on reload) — no backend.

## Technical details

**New parser — `src/lib/quiz.ts`**
- `parseQuiz(source: string): { title?: string; questions: QuizQuestion[] }`.
- `QuizQuestion = { prompt: string; options: { text: string; correct: boolean }[]; explanation?: string; multi: boolean }` where `multi` = more than one correct option.
- Split body on `/^---$/` lines into question chunks; within a chunk read the `Q:` prompt, `- [x]/- [ ]` options, and `>` explanation. Tolerate extra whitespace.

**New component — `src/components/Quiz.tsx`**
- Props: `{ title?: string; questions: QuizQuestion[] }`.
- Local state: `current` index, per-question `selected` set + `answered` flag, running `score`.
- Single-choice: option click sets selection, marks answered, scores immediately. Multi-choice: toggle selections, **Check answer** marks answered and scores (correct only if selected set exactly equals correct set).
- Renders header (title + "Question X of N"), the option list with post-answer styling/icons, explanation, and footer buttons (**Next question** / on last: score + **Restart quiz**).
- Uses semantic tokens + existing `lumi-*` tokens; icons from `lucide-react` (`Check`, `X`) already used elsewhere.

**Wire into rendering — `src/components/MarkdownRenderer.tsx`**
- In the existing `pre` handler, read the code child's `className`. If it is `language-quiz`, parse the raw text with `parseQuiz` and return `<Quiz .../>` instead of `<CodeBlock>`. (The fenced text is available via the code child's children.) This mirrors how `pre` already dispatches to `CodeBlock`.
- Ensure `applyGlossaryMarkers` already skips fenced blocks (it does), so quiz source is untouched by glossary/markdown processing.

**Styling — `src/styles.css`**
- Add `.quiz-*` classes (or rely on Tailwind utilities in the component) for the card, accent bar, option states (default / correct / wrong / selected), reusing `--lumi-teal`, `--lumi-magenta`, `--lumi-blue`, `--lumi-purple` and `color-mix` tints consistent with callouts. Correct = teal tint, wrong pick = magenta tint.

**Docs — `content/index.md`**
- Add a new "Quizzes" section under "Technical content" showing the ```` ```quiz ```` syntax (title, `Q:`, `[x]`/`[ ]`, `>` explanation, `---` separator, single vs. select-all behaviour).

**Sample — `content/chapter1.md`**
- Add one example quiz so the feature is visible immediately.

## Out of scope
- No score persistence, accounts, or analytics (in-memory only).
- No randomising option order or timed quizzes (can be added later).
