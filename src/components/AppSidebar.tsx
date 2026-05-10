import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { buildNavTree, type NavNode } from "@/lib/content";
import { siteConfig } from "../../site.config";

function slugToHref(slug: string) {
  return slug === "" ? "/" : `/${slug}`;
}

export function AppSidebar() {
  const tree = React.useMemo(() => buildNavTree(), []);
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-lumi-blue text-xs font-bold tracking-tight text-white">
            AIF
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-sidebar-foreground">
              LUMI AI Factory
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              {siteConfig.title}
            </span>
          </div>
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
    </Sidebar>
  );
}

function isActiveTree(node: NavNode, pathname: string): boolean {
  if (slugToHref(node.page.slug) === pathname) return true;
  return node.children.some((c) => isActiveTree(c, pathname));
}

function NavItem({ node, pathname }: { node: NavNode; pathname: string }) {
  const href = slugToHref(node.page.slug);
  const active = pathname === href;

  if (node.children.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active}>
          <Link to={href}>{node.page.frontmatter.title}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const branchActive = isActiveTree(node, pathname);

  return (
    <Collapsible defaultOpen={branchActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={active}>
            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            <span>{node.page.frontmatter.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild isActive={active}>
                <Link to={href}>Overview</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {node.children.map((child) => {
              const childHref = slugToHref(child.page.slug);
              return (
                <SidebarMenuSubItem key={child.page.slug}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === childHref}
                  >
                    <Link to={childHref}>{child.page.frontmatter.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
