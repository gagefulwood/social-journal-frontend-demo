"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth/authApi";

export default function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await authApi.login({
        username,
        password,
      });

      router.push("/dashboard");
    } catch {
      setError("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Username"
        className="border p-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </form>
  );
}