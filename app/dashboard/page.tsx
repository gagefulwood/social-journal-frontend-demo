"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSJ } from "@/components/layout/SideBarLayout";

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        
        <SidebarSJ />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-6 text-gray-600">
            Welcome to your dashboard.
          </p>

            <p className="text-2xl text-gray-600 mb-10">
                This page is currently under construction. Please excuse our progress!
            </p>

            <div className="flex justify-center items-center mb-8">
                <img
                    className="max-w-xs md:max-w-sm"
                    src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnIxdzYzZzZ5Z2Rwd3FubWY2bmg2b3pwMGdyZW53cGswbnd4YjV1ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vR1dPIYzQmkRzLZk2w/giphy.gif"
                    alt="Penguin Progress"
                />
            </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

