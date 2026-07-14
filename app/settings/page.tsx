"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/authApi";
import type { ApiError, UpdateProfilePayload, User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileValues = Required<
  Pick<User, "first_name" | "last_name" | "username" | "email">
> & { phone_number: string };

function toProfileValues(profile: User): ProfileValues {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    username: profile.username,
    email: profile.email,
    phone_number: profile.phone_number ?? "",
  };
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [values, setValues] = useState<ProfileValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const currentProfile = await authApi.getProfile();
        if (!cancelled) {
          setProfile(currentProfile);
          setValues(toProfileValues(currentProfile));
        }
      } catch (err) {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message || "Unable to load settings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: UpdateProfilePayload = {
        ...values,
        phone_number: values.phone_number || undefined,
      };
      const updatedProfile = await authApi.patchProfile(payload);
      setProfile(updatedProfile);
      setValues(toProfileValues(updatedProfile));
      toast.success("Profile updated.");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  function updateValue(field: keyof ProfileValues, value: string) {
    setValues((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="font-sans text-3xl font-semibold leading-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your profile and account security details current.
        </p>
      </header>

      {loading && (
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </section>
      )}

      {!loading && error && !values && (
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="font-medium">Unable to load settings</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </section>
      )}

      {values && (
        <>
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Profile</h2>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={saveProfile}
            >
              <Field
                id="first_name"
                label="First name"
                value={values.first_name}
                onChange={(value) => updateValue("first_name", value)}
              />
              <Field
                id="last_name"
                label="Last name"
                value={values.last_name}
                onChange={(value) => updateValue("last_name", value)}
              />
              <Field
                id="username"
                label="Username"
                value={values.username}
                onChange={(value) => updateValue("username", value)}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={(value) => updateValue("email", value)}
              />
              <div className="sm:col-span-2">
                <Field
                  id="phone_number"
                  label="Phone number (optional)"
                  type="tel"
                  value={values.phone_number}
                  onChange={(value) => updateValue("phone_number", value)}
                />
              </div>
              {error && (
                <p
                  className="sm:col-span-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  Multi-factor authentication
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile?.is_mfa_enabled
                    ? "Multi-factor authentication is enabled for this account."
                    : "Add a verification step when signing in."}
                </p>
                {!profile?.is_mfa_enabled && (
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/auth/mfa-setup">Set up MFA</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
