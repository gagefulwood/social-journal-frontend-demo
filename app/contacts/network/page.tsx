"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContactNetworkPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage the people in your contacts.
          </p>
        </div>
        <Button asChild>
          <Link href="/contacts/new">
            <Plus className="size-4" />
            New Contact
          </Link>
        </Button>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <Tabs
          value="network"
          onValueChange={(value) => {
            if (value === "list") {
              router.push("/contacts");
            }
          }}
        >
          <TabsList className="w-full md:w-fit">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      <section className="rounded-lg border border-border bg-card p-10 text-center">
        <h2 className="text-xl font-semibold">Network view coming soon</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Relationship mapping will be added after the MVP contacts list flow is
          stable.
        </p>
      </section>
    </main>
  );
}
