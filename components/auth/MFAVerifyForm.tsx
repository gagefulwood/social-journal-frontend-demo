"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/authApi";
import { applyAuthMetadata } from "@/lib/auth/auth-utils";
import type { ApiError } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MFAVerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const metadata = await authApi.verifyMFA(code);
      applyAuthMetadata(metadata);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setCode("");
      setError(apiError.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Input
        type="text"
        inputMode="numeric"
        placeholder="6-digit code"
        className="text-center text-lg tracking-widest"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        maxLength={6}
      />

      <Button type="submit" disabled={loading || code.length !== 6}>
        {loading ? "Verifying..." : "Verify"}
      </Button>
    </form>
  );
}
