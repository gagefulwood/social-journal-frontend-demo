"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/authApi";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
};

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirm: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const evaluatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPasswordStrength(score);
  };

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});

    if (form.password !== form.password_confirm) {
      setFieldErrors({
        password_confirm: ["Passwords do not match"],
      });
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        ...form,
        phone_number: form.phone_number || undefined,
      });

      router.push("/auth/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        if (data && typeof data === "object") {
          setFieldErrors(data as Record<string, string[]>);
        } else {
          setError("Registration failed");
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <Label>First Name</Label>
        <Input
          value={form.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
        />
        {fieldErrors.first_name && (
          <p className="text-red-500 text-sm">{fieldErrors.first_name[0]}</p>
        )}
      </div>

      <div>
        <Label>Last Name</Label>
        <Input
          value={form.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
        />
        {fieldErrors.last_name && (
          <p className="text-red-500 text-sm">{fieldErrors.last_name[0]}</p>
        )}
      </div>

      <div>
        <Label>Username</Label>
        <Input
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
        />
        {fieldErrors.username && (
          <p className="text-red-500 text-sm">{fieldErrors.username[0]}</p>
        )}
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {fieldErrors.email && (
          <p className="text-red-500 text-sm">{fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <Label>Phone Number (optional)</Label>
        <Input
          value={form.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
        />
        {fieldErrors.phone_number && (
          <p className="text-red-500 text-sm">
            {fieldErrors.phone_number[0]}
          </p>
        )}
      </div>

      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => {
            handleChange("password", e.target.value);
            evaluatePasswordStrength(e.target.value);
          }}
        />

        <div className="h-2 w-full bg-gray-200 rounded mt-2">
          <div
            className={`h-2 rounded ${
              passwordStrength <= 1
                ? "bg-red-500"
                : passwordStrength <= 3
                ? "bg-yellow-400"
                : "bg-green-500"
            }`}
            style={{ width: `${(passwordStrength / 4) * 100}%` }}
          />
        </div>

        {fieldErrors.password && (
          <p className="text-red-500 text-sm">{fieldErrors.password[0]}</p>
        )}
      </div>

      <div>
        <Label>Confirm Password</Label>
        <Input
          type="password"
          value={form.password_confirm}
          onChange={(e) =>
            handleChange("password_confirm", e.target.value)
          }
        />
        {fieldErrors.password_confirm && (
          <p className="text-red-500 text-sm">
            {fieldErrors.password_confirm[0]}
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}