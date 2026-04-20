"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contactsApi } from "@/lib/api/contactsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  nickname?: string | null;
  phone_number?: string | null;
};

export function ContactForm({
  existingContact,
}: {
  existingContact?: Contact;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: existingContact?.first_name ?? "",
    last_name: existingContact?.last_name ?? "",
    nickname: existingContact?.nickname ?? "",
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
        ...(form.nickname && { nickname: form.nickname }),
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
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
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
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
          {errors[field] && (
            <p className="text-sm text-destructive">{errors[field][0]}</p>
          )}
        </div>
      ))}

      <div>
        <Label>Nickname</Label>
        <Input
          value={form.nickname}
          onChange={(e) => handleChange("nickname", e.target.value)}
        />
        {errors.nickname && (
          <p className="text-sm text-destructive">{errors.nickname[0]}</p>
        )}
      </div>

      <div>
        <Label>Phone Number</Label>
        <Input
          value={form.phone_number}
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