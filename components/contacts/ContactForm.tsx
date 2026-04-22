"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contactsApi } from "@/lib/api/contactsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact } from "@/models/contacts";

export function ContactForm({
  existingContact,
}: {
  existingContact?: Contact;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: existingContact?.first_name ?? "",
    last_name: existingContact?.last_name ?? "",
    email: existingContact?.email ?? "",
    phone_number: existingContact?.phone_number ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        ...(form.phone_number && { phone_number: form.phone_number }),
      };

      if (existingContact) {
        await contactsApi.update(existingContact.id, payload);
        router.push(`/contacts/${existingContact.id}`);
      } else {
        const newContact = await contactsApi.create(payload);
        router.push(`/contacts/${newContact.id}`);
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: unknown } }).response?.data
      ) {
        const data = (err as { response: { data: unknown } }).response.data;
        if (data && typeof data === "object") {
          setErrors(data as Record<string, string[]>);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {(["first_name", "last_name", "email"] as const).map((field) => (
        <div key={field}>
          <Label>{field.replace("_", " ")}</Label>
          <Input
            value={form[field] ?? ""}
            onChange={(e) => handleChange(field, e.target.value)}
          />
          {errors[field] && (
            <p className="text-sm text-destructive">{errors[field][0]}</p>
          )}
        </div>
      ))}

      <div>
        <Label>Phone Number</Label>
        <Input
          value={form.phone_number ?? ""}
          onChange={(e) => handleChange("phone_number", e.target.value)}
        />
        {errors.phone_number && (
          <p className="text-sm text-destructive">
            {errors.phone_number[0]}
          </p>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}