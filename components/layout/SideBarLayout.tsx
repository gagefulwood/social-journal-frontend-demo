"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FocusEventHandler } from "react";
import {
  CalendarDays,
  HeartHandshake,
  LayoutDashboard,
  NotebookTabs,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: UsersRound },
  { label: "Journals", href: "/journals", icon: NotebookTabs },
  { label: "Events", href: "/events", icon: CalendarDays },
];

const settingsItem = { label: "Settings", href: "/settings", icon: Settings };

type SidebarSJProps = {
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
  onFocusCapture: () => void;
  onBlurCapture: FocusEventHandler<HTMLDivElement>;
};

export function SidebarSJ({
  pinned,
  onPinnedChange,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onFocusCapture,
  onBlurCapture,
}: SidebarSJProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        overlayOnExpand
        className="z-40 group-data-[state=expanded]:shadow-lg"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
      >
        <SidebarHeader className="border-b border-sidebar-border p-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              aria-label="Social Journal dashboard"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <HeartHandshake className="size-5" aria-hidden="true" />
              </span>
              <span className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">
                Social Journal
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={pinned}
                  aria-label={
                    pinned
                      ? "Allow sidebar to collapse"
                      : "Keep sidebar expanded"
                  }
                  onClick={() => onPinnedChange(!pinned)}
                  className="shrink-0 group-data-[collapsible=icon]:hidden"
                >
                  {pinned ? (
                    <PanelLeftOpen className="size-4" />
                  ) : (
                    <PanelLeftClose className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {pinned ? "Allow sidebar to collapse" : "Keep sidebar expanded"}
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <nav aria-label="Main navigation">
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  active={isActiveRoute(pathname, item.href)}
                />
              ))}
            </SidebarMenu>
          </nav>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <SidebarMenu>
            <NavigationItem
              item={settingsItem}
              active={isActiveRoute(pathname, settingsItem.href)}
            />
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}

function NavigationItem({
  item,
  active,
}: {
  item: { label: string; href: string; icon: LucideIcon };
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        size="lg"
        tooltip={item.label}
        isActive={active}
        className="h-11 gap-3 px-3 data-active:bg-accent data-active:text-accent-foreground group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:p-3!"
      >
        <Link
          href={item.href}
          aria-label={item.label}
          aria-current={active ? "page" : undefined}
        >
          <Icon className="size-5!" aria-hidden="true" />
          <span className="group-data-[collapsible=icon]:hidden">
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
