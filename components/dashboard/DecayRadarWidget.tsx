"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { DecayContact } from "@/models/dashboard";

export function DecayRadarWidget({ contacts }: { contacts: DecayContact[] }) {
  const router = useRouter();

  const sorted = [...contacts].sort(
    (a, b) => b.days_since_interaction - a.days_since_interaction
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decay Radar</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No contacts to display.
          </p>
        )}

        {sorted.map((c) => (
          <div key={c.contact.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {c.contact.first_name} {c.contact.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.days_since_interaction === 9999
                  ? "Never interacted"
                  : `${c.days_since_interaction} days ago`}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/contacts/${c.contact.id}`)}
            >
              View
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}