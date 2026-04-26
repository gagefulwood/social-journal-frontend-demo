// app/auth/mfa-setup/page.tsx
"use client";

import React from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { MFASetupCard } from "@/components/auth/MFASetupCard";
import { authApi } from "@/lib/auth/authApi";

export default function MFASetupPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">MFA Setup</h2>
      <MFASetupCard qrCodeUri={qrCodeUri} manualKey={manualKey} />
    </AuthLayout>
  );
}