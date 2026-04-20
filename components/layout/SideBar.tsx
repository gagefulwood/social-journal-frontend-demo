"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Journal", href: "/journal", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-background px-4 py-6 gap-2">
      <span className="text-xl font-bold mb-4 px-2">Social Journal</span>
      <Separator className="mb-4" />
      {navItems.map(({ label, href, icon: Icon }) => (
        <Button
          key={href}
          variant={pathname.startsWith(href) ? "secondary" : "ghost"}
          className={cn("justify-start gap-3 w-full")}
          asChild
        >
          <Link href={href}>
            <Icon size={18} />
            {label}
          </Link>
        </Button>
      ))}
    </aside>
  );
}