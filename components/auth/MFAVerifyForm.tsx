"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth/authApi";
import { useAuthStore } from "@/store/useAuthStore";

export const MFAVerifyForm: React.FC = () => {
  const router = useRouter();

  const mfaToken = useAuthStore((state) => state.mfaToken);
  const setMfaToken = useAuthStore((state) => state.setMfaToken);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // 🚨 prevent refresh issues
  useEffect(() => {
    if (!mfaToken) {
      router.push("/auth/login");
    }
  }, [mfaToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await authApi.verifyMFA({
        code,
        token: mfaToken || "",
      });

      setMfaToken(null); // cleanup
      router.push("/dashboard");
    }
    catch (err: any) {
      const apiErrors = err?.response?.data;

      if (apiErrors && typeof apiErrors === "object") {
        setFieldErrors(apiErrors);
      } else {
        setError("Invalid code");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        maxLength={6}
        className="border p-2 rounded text-center tracking-widest text-lg"
      />

      {fieldErrors.code && (
        <p className="text-red-500 text-sm text-center">
          {fieldErrors.code[0]}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
};