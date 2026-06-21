// components/layout/AuthLayout.tsx
"use client";

import React, { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
};
