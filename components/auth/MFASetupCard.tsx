// components/auth/MFASetupCard.tsx
"use client";

import React from "react";

interface MFASetupCardProps {
  qrCodeUri: string;
  manualKey: string;
}

export const MFASetupCard: React.FC<MFASetupCardProps> = ({ qrCodeUri, manualKey }) => {
  return (
    <div className="p-6 border rounded-lg shadow-md bg-gray-50">
      <h3 className="font-semibold mb-4">MFA Setup</h3>
      <div className="flex flex-col items-center">
        <img src={qrCodeUri} alt="QR Code for MFA" className="mb-4 w-48 h-48" />
        <p className="text-sm break-all">Manual key: <span className="font-mono">{manualKey}</span></p>
      </div>
    </div>
  );
};