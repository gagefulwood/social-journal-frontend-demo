"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/authApi";
import { setAuth } from "@/lib/auth/auth-utils";

export function MFAVerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.verifyMFA(code);
      // store fresh tokens that don't have mfa_pending=true
      if (res.access && res.refresh) {
        setAuth(res.access, res.refresh);
      }
      router.push("/dashboard");
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="6-digit code"
        className="border p-2 rounded text-center tracking-widest text-lg"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}