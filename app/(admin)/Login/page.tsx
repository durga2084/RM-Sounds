"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, User } from "lucide-react";
import { hasAdminSession } from "@/lib/adminSession";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (hasAdminSession()) {
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("token="))
          ?.split("=")[1];

        if (token && !localStorage.getItem("AdminToken")) {
          localStorage.setItem("AdminToken", token);
        }

        router.replace("/Dashboard");
      }
    } catch (err) {
      console.error("Error checking token:", err);
    }
  }, [router]);

  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!Username || !Password) {
      setError("Please enter Username and Password.");
      return;
    }

    setLoading(true);

    try {
      const DeviceInfo = `${navigator.platform} | ${navigator.userAgent}`;

      const { AdminLoginAPI } =
        await import("@/app/(admin)/1constants/API_AdminLogin");
      const response = await fetch(AdminLoginAPI.Login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Username,
          Password: btoa(Password),
          DeviceInfo,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed.");
        return;
      }

      localStorage.setItem("AdminToken", result.token);
      localStorage.setItem("AdminUser", JSON.stringify(result.data));

      const expires = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toUTCString();
      document.cookie = `token=${result.token}; Path=/; Expires=${expires}; SameSite=Lax`;

      router.push("/Dashboard");
    } catch (err) {
      console.error(err);
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <div className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(65,88,208,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(200,80,192,0.25),_transparent_40%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f172a]/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-[#4158D0] to-[#C850C0] p-3 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#C850C0]">
                  Admin access
                </p>

                <h1 className="text-2xl font-black">RM Sounds</h1>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black">Welcome back</h2>

              <p className="mt-2 text-sm text-gray-400">
                Sign in to manage bookings, events and contact details.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                  Username
                </label>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-[#4158D0]" />

                  <input
                    type="text"
                    value={Username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Username"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                  Password
                </label>

                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-[#C850C0]" />

                  <input
                    type="Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#FF512F] px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}

                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              <Link
                href="/"
                className="font-medium text-[#4158D0] hover:text-[#C850C0]"
              >
                Return to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
