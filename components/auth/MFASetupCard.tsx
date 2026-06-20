"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { authApi } from "@/lib/api/authApi";
import { applyAuthMetadata } from "@/lib/auth/auth-utils";
import type { ApiError, MFASetupResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MFASetupCard() {
  const router = useRouter();
  const [setup, setSetup] = useState<MFASetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const loadSetup = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await authApi.setupMFA();
      setSetup(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Unable to load MFA setup.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await authApi.setupMFA();
        if (!cancelled) {
          setSetup(data);
        }
      } catch (err) {
        const apiError = err as ApiError;
        if (!cancelled) {
          setError(apiError.message || "Unable to load MFA setup.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setVerifying(true);

    try {
      const metadata = await authApi.verifyMFA(code);
      applyAuthMetadata(metadata);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setCode("");
      setError(apiError.message || "Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-6 shadow-md">
      <h3 className="mb-4 font-semibold">MFA Setup</h3>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading MFA setup...</p>
      )}

      {!loading && error && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-destructive">{error}</p>
          {!setup && (
            <Button type="button" variant="outline" onClick={loadSetup}>
              Retry
            </Button>
          )}
        </div>
      )}

      {!loading && setup && (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4">
            <QRCodeSVG value={setup.totpUri} className="size-48" />
            <p className="break-all text-sm">
              Manual key: <span className="font-mono">{setup.manualKey}</span>
            </p>
          </div>

          <Input
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            className="text-center text-lg tracking-widest"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={6}
          />

          <Button type="submit" disabled={verifying || code.length !== 6}>
            {verifying ? "Verifying..." : "Confirm MFA"}
          </Button>
        </form>
      )}
    </div>
  );
}
