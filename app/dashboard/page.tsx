"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
                  
            <p className="text-center mt-6 text-gray-600">
                Contacts
                <Link
                  href="/contacts/"
                  className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
                >
                 Go to Contacts 
                </Link>
            </p>

            <p className="text-center mt-6 text-gray-600">
                Journals
                <Link
                  href="/journals/"
                  className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
                >
                 Go to Journals 
                </Link>
            </p>

            <p className="text-center mt-6 text-gray-600">
                Events
                <Link
                  href="/events/"
                  className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
                >
                 Go to Events 
                </Link>
            </p>
        </main>
    );
}