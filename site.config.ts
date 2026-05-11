// Site-level configuration for the LUMI AI Factory learning template.
// This is the only configuration file authors might want to edit.

export const siteConfig = {
  /** Shown in the browser tab and the header. */
  title: "LUMI AIF Learning Materials",
  /** Default meta description and og:description. */
  description: "Official training documentation for CSC staff and partners.",
  /** Canonical site URL (no trailing slash). Used for sitemap.xml + robots.txt. */
  siteUrl: "https://arbruiser.github.io/LUMI_AIF_template_Loveable",
  /** External links shown on the right of the header. */
  auxLinks: [
    { label: "LUMI AIF Website", href: "https://lumi-ai-factory.eu/" },
  ],
  /**
   * GitHub repository in the form "owner/repo".
   * Used to render the "Edit this page on GitHub" link in the footer.
   * Leave as null to hide the edit link.
   */
  githubRepo: "Arbruiser/LUMI_AIF_template_Loveable" as string | null,
  /** Branch the edit links should point to. */
  githubBranch: "main",
};

export type SiteConfig = typeof siteConfig;
