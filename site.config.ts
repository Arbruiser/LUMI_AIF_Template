// Site-level configuration for the LUMI AI Factory learning template.
//
// Content creators normally only need to edit `title`, `description`, and
// `auxLinks`. The URL, GitHub repo, and branch are auto-detected from the
// GitHub Actions environment at build time, so the template works for any
// fork regardless of repo name — leave them as empty fallbacks unless you
// are deploying outside GitHub Pages.

export const siteConfig = {
  /** Shown in the browser tab and the header. */
  title: "LUMI AIF Learning Materials",
  /** Default meta description and og:description. */
  description: "Official training documentation for CSC staff and partners.",
  /**
   * Canonical site URL (no trailing slash). Auto-detected at build time from
   * GITHUB_REPOSITORY in the deploy workflow. Only set this manually when
   * deploying outside GitHub Pages.
   */
  siteUrl: import.meta.env.VITE_SITE_URL ?? "",
  /** External links shown on the right of the header. */
  auxLinks: [
    { label: "LUMI AIF Website", href: "https://lumi-ai-factory.eu/" },
  ],
  /**
   * GitHub repository in the form "owner/repo". Auto-detected from
   * GITHUB_REPOSITORY in the deploy workflow. Used to render the
   * "Edit this page on GitHub" link in the footer. Set to null to hide.
   */
  githubRepo: (import.meta.env.VITE_GITHUB_REPO ?? null) as string | null,
  /** Branch the edit links should point to. Auto-detected from GITHUB_REF_NAME. */
  githubBranch: import.meta.env.VITE_GITHUB_BRANCH ?? "main",
};

export type SiteConfig = typeof siteConfig;
