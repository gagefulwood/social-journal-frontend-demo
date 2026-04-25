"use client";

import React from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Reset Password
      </h2>
      <ResetPasswordForm />
    </AuthLayout>
  );
}