"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/authApi";
import { applyAuthMetadata, getPostAuthRoute } from "@/lib/auth/auth-utils";
import type { ApiError } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const metadata = await authApi.login(identifier, password);
      applyAuthMetadata(metadata);
      router.push(getPostAuthRoute(metadata));
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.status === 401
          ? "Invalid email/username or password. Please try again."
          : apiError.message || "Unable to log in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Input
        type="text"
        placeholder="Email or Username"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
