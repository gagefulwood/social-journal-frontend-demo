"use client";

import React from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Register
      </h2>
      <RegisterForm />
    </AuthLayout>
  );
}