// app/auth/mfa/page.tsx
"use client";

import React from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { MFAVerifyForm } from "@/components/auth/MFAVerifyForm";

export default function MFAPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">MFA Verification</h2>
      <MFAVerifyForm />
    </AuthLayout>
  );
}