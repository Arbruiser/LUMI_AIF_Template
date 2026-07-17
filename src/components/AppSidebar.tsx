import { Link, useRouterState } from "@tanstack/react-router";
import { BookMarked, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { buildNavTree, findPage, type NavNode } from "@/lib/content";

const logoLight = `${import.meta.env.BASE_URL}assets/lumi-logo-light.svg`;
const logoDark = `${import.meta.env.BASE_URL}assets/lumi-logo-dark.svg`;

function slugToHref(slug: string) {
  return slug === "" ? "/" : `/${slug}`;
}

export function AppSidebar() {
  const tree = React.useMemo(() => buildNavTree(), []);
  const glossary = React.useMemo(() => findPage("glossary"), []);
  const pathname = useRouterState({
    // Strip the trailing slash (trailingSlash: "always") so comparisons
    // against slug-derived hrefs like "/Chapter_2" keep matching.
    select: (s) => s.location.pathname.replace(/\/+$/, "") || "/",
  });

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex-row items-center border-b border-sidebar-border px-3 py-0">
        <Link to="/" className="block w-full">
          <img src={logoLight} alt="LUMI AI Factory" className="w-full h-auto block dark:hidden" />
          <img src={logoDark} alt="LUMI AI Factory" className="w-full h-auto hidden dark:block" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {tree.map((node) => (
                <NavItem key={node.page.slug} node={node} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {glossary && (
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="sm"
                isActive={pathname === "/glossary"}
                className="text-sidebar-foreground/70 data-[active=true]:text-sidebar-foreground"
              >
                <Link to="/glossary" draggable={false}>
                  <BookMarked className="h-3.5 w-3.5" />
                  <span>{glossary.frontmatter.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

function isActiveTree(node: NavNode, pathname: string): boolean {
  if (slugToHref(node.page.slug) === pathname) return true;
  return node.children.some((c) => isActiveTree(c, pathname));
}

/**
 * Branch open state: collapsed by default, opened automatically whenever a
 * navigation lands inside the branch (sidebar click, in-content link,
 * prev/next), while still letting the reader collapse it by hand.
 */
function useBranchOpen(branchActive: boolean, pathname: string) {
  const [open, setOpen] = React.useState(branchActive);
  React.useEffect(() => {
    if (branchActive) setOpen(true);
  }, [branchActive, pathname]);
  return [open, setOpen] as const;
}

const wrapTitle =
  "h-auto min-h-8 py-1.5 [&>span:last-child]:whitespace-normal [&>span:last-child]:truncate-none";

/** Chevron that toggles a branch without navigating — the row's title is the
 * link to the parent page itself, so expand/collapse gets its own button. */
function BranchToggle({ open }: { open: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <SidebarMenuAction
        className="data-[state=open]:rotate-90"
        aria-label={open ? "Collapse section" : "Expand section"}
      >
        <ChevronRight />
      </SidebarMenuAction>
    </CollapsibleTrigger>
  );
}

function NavItem({ node, pathname }: { node: NavNode; pathname: string }) {
  const href = slugToHref(node.page.slug);
  const active = pathname === href;
  const branchActive = isActiveTree(node, pathname);
  const [open, setOpen] = useBranchOpen(branchActive, pathname);

  if (node.children.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} className={wrapTitle}>
          <Link to={href} draggable={false}>
            <span className="whitespace-normal leading-snug">{node.page.frontmatter.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} className={`${wrapTitle} pr-8`}>
          <Link to={href} draggable={false}>
            <span className="whitespace-normal leading-snug">{node.page.frontmatter.title}</span>
          </Link>
        </SidebarMenuButton>
        <BranchToggle open={open} />
        <CollapsibleContent>
          <NavSubTree node={node} pathname={pathname} />
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NavSubTree({ node, pathname }: { node: NavNode; pathname: string }) {
  return (
    <SidebarMenuSub>
      {node.children.map((child) => (
        <NavSubItem key={child.page.slug} node={child} pathname={pathname} />
      ))}
    </SidebarMenuSub>
  );
}

function NavSubItem({ node, pathname }: { node: NavNode; pathname: string }) {
  const href = slugToHref(node.page.slug);
  const active = pathname === href;
  const branchActive = isActiveTree(node, pathname);
  const [open, setOpen] = useBranchOpen(branchActive, pathname);

  if (node.children.length === 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={active} className={wrapTitle}>
          <Link to={href} draggable={false}>
            <span className="whitespace-normal leading-snug">{node.page.frontmatter.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuSubItem className="relative">
        <SidebarMenuSubButton asChild isActive={active} className={`${wrapTitle} pr-8`}>
          <Link to={href} draggable={false}>
            <span className="whitespace-normal leading-snug">{node.page.frontmatter.title}</span>
          </Link>
        </SidebarMenuSubButton>
        <BranchToggle open={open} />
        <CollapsibleContent>
          <NavSubTree node={node} pathname={pathname} />
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}
