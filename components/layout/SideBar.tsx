"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Contacts", href: "/contacts" },
  { name: "Events", href: "/events" },
  { name: "Groups", href: "/groups" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-full w-full flex-col bg-white border-r">
      {/* User */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Social Journal</h2>
        <p className="text-sm text-gray-500">{user?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}