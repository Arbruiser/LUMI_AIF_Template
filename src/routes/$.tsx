import { createFileRoute, notFound } from "@tanstack/react-router";
import { findPage } from "@/lib/content";
import { PageLayout } from "@/components/PageLayout";
import { siteConfig } from "../../site.config";

export const Route = createFileRoute("/$")({
  component: CatchAllPage,
  head: ({ params }) => {
    const slug = (params as { _splat?: string })._splat ?? "";
    const page = findPage(slug);
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

function CatchAllPage() {
  const params = Route.useParams() as { _splat?: string };
  const slug = params._splat ?? "";
  const page = findPage(slug);
  if (!page) throw notFound();
  return <PageLayout page={page} />;
}
