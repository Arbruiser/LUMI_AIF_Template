import { createFileRoute, notFound } from "@tanstack/react-router";
import { findPage } from "@/lib/content";
import { PageLayout } from "@/components/PageLayout";
import { siteConfig } from "../../site.config";

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => {
    const page = findPage("");
    const title = page?.frontmatter.title
      ? `${page.frontmatter.title} — ${siteConfig.title}`
      : siteConfig.title;
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
      ],
    };
  },
});

function IndexPage() {
  const page = findPage("");
  if (!page) throw notFound();
  return <PageLayout page={page} />;
}
