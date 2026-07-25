"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-linear-to-b from-blue-300 to-slate-50">
      <main className="w-full max-w-md bg-white rounded-2xl shadow-lg p-12 flex flex-col gap-3">

        {/* Company Logo */}
        <div className="flex justify-center mb-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-md flex items-center justify-center bg-white">
            <Image
              src="/Logo.jpeg"
              alt="Company Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 text-center">
          Isuru Fiberglass Industries
        </h1>

        <p className="text-sm text-slate-500 text-center">
          Sign in to your company account
        </p>

        <form className="flex flex-col gap-3 mt-1" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <label className="text-sm text-slate-700 mb-1" htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            className="px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-sm text-slate-700 mb-1" htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            className="px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="mt-2 bg-blue-900 text-white rounded-lg py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <footer className="mt-3 text-sm text-slate-500 text-center">
          <span>Need help? Contact your administrator.</span>
        </footer>
      </main>
    </div>
  );
}