## Why your rename broke the site

Two things are hardcoded to the original repo name. The base path is already auto-detected in `.github/workflows/deploy.yml` (good), but `site.config.ts` is not:

```ts
siteUrl: "https://arbruiser.github.io/LUMI_AIF_template_Loveable",
githubRepo: "Arbruiser/LUMI_AIF_template_Loveable" as string | null,
```

These feed `sitemap.xml`, `robots.txt`, canonical URL, and the "Edit this page on GitHub" link — so after a rename they all point to a repo that no longer exists, and the sitemap advertises a broken domain to search engines.

(The "everything broke" symptom you saw is most likely the GitHub Pages URL itself changing — the new URL is `https://arbruiser.github.io/<new-repo>/`. Once a fresh build runs on the renamed repo, the auto-detected `VITE_BASE_PATH` makes assets load again. If the live site is still blank, it just needs a new commit pushed to `main` to re-trigger the deploy workflow.)

## Goal

A content creator forks the template, renames it whatever they want, edits `content/*.md`, and everything Just Works — no config edits required.

## Plan

### 1. Auto-derive repo + site URL at build time

In `.github/workflows/deploy.yml`, export two more env vars alongside `VITE_BASE_PATH`:

- `VITE_GITHUB_REPO` = `${GITHUB_REPOSITORY}` (e.g. `arbruiser/lumi-aif-creator-kit`)
- `VITE_SITE_URL` = computed from `${GITHUB_REPOSITORY_OWNER}` + repo name:
  - user/org site (`<user>.github.io`) → `https://<user>.github.io`
  - project site → `https://<owner>.github.io/<repo>`
- Pass `VITE_GITHUB_BRANCH=${GITHUB_REF_NAME}` so the "Edit on GitHub" link tracks the deployed branch.

### 2. Make `site.config.ts` read those vars with safe fallbacks

```ts
siteUrl: import.meta.env.VITE_SITE_URL ?? "",
githubRepo: import.meta.env.VITE_GITHUB_REPO ?? null,
githubBranch: import.meta.env.VITE_GITHUB_BRANCH ?? "main",
```

Keep `title` and `description` and `auxLinks` as the only fields creators are expected to edit. Add a clear comment saying the URL/repo fields are auto-filled by the deploy workflow and should normally be left blank.

### 3. Make `vite.config.ts` sitemap plugin use the resolved URL

The plugin currently imports `siteConfig.siteUrl` at build time. Switch it to read `process.env.VITE_SITE_URL` (already available in the GitHub Actions build step) with the `siteConfig` value as fallback. If neither is set, skip sitemap generation silently (already does).

### 4. README update

Remove the implicit assumption that creators edit `site.config.ts`. Document that:
- Title/description/aux links are the only fields to touch.
- URL + GitHub repo are detected automatically from GitHub Actions.
- After forking and renaming: just push a commit to `main` to trigger a fresh deploy.

### 5. One-time fix for your current repo

After the changes above land, just push any commit to `main`. The workflow will rebuild with the correct base path and site URL for `lumi-aif-creator-kit` and the site will come back.

## Files to change

- `.github/workflows/deploy.yml` — export `VITE_SITE_URL`, `VITE_GITHUB_REPO`, `VITE_GITHUB_BRANCH`
- `site.config.ts` — read from env with fallbacks; add comments
- `vite.config.ts` — sitemap plugin reads `process.env.VITE_SITE_URL`
- `README.md` — clarify what creators need to edit (almost nothing)
