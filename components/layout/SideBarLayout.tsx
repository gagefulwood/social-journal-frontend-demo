"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contacts", href: "/contacts" },
  { label: "Journals", href: "/journals" },
  { label: "Events", href: "/events" },
];

export function SidebarSJ() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>

        <div className="px-4 pt-6 pb-4">
          <h1 className="text-lg font-semibold tracking-wide">
            Social Journal
          </h1>
          <Separator className="mt-3" />
        </div>

        <div className="flex-1 px-2 pt-6">
          <SidebarMenu className="space-y-3">
            {items.map((item) => {
              const active = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className="py-3"
                  >
                    <Link href={item.href}>
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

      </SidebarContent>
    </Sidebar>
  );
}
