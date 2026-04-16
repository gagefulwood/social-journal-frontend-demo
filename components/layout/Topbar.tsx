"use client";

import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/authApi";

export default function Topbar() {
  const { user, logout: clearAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth(); // clears your store
    }
  };

  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-3">
      {/* Title */}
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* User + Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
            {user?.name?.[0] || "U"}
          </div>
          <span className="hidden sm:inline text-sm">
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}