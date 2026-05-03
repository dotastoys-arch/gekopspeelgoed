"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Mode = "login" | "register";

export default function InloggenPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/klant/login" : "/api/klant/registreer";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, name: form.name };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
      return;
    }

    router.push("/mijn-account");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-5xl mb-6 text-center">🔐</div>
          <h1 className="text-2xl sm:text-3xl font-black text-center mb-2" style={{ color: "#2D2B3A" }}>
            Mijn account
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            {mode === "login" ? "Log in om je bestellingen te bekijken." : "Maak een account aan om je bestellingen bij te houden."}
          </p>

          {/* Tab switcher */}
          <div className="flex rounded-2xl p-1 mb-6" style={{ background: "#EEECF8" }}>
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-black transition-colors"
              style={mode === "login"
                ? { background: "#9B91BE", color: "white" }
                : { color: "#6B7280" }}
            >
              Inloggen
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-black transition-colors"
              style={mode === "register"
                ? { background: "#9B91BE", color: "white" }
                : { color: "#6B7280" }}
            >
              Account aanmaken
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Naam</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jouw naam"
                  className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
                  style={{ borderColor: "#E5E7EB" }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mailadres</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jouw@email.nl"
                className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
                style={{ borderColor: "#E5E7EB" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Wachtwoord</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={mode === "register" ? "Minimaal 8 tekens" : "Jouw wachtwoord"}
                className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
                style={{ borderColor: "#E5E7EB" }}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-opacity disabled:opacity-60"
              style={{ background: "#9B91BE" }}
            >
              {loading ? "Even wachten..." : mode === "login" ? "Inloggen" : "Account aanmaken"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link href="/" className="hover:underline">← Terug naar de shop</Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
