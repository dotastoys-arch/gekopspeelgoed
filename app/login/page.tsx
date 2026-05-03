"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Inloggen mislukt.");
      if (res.status === 429) {
        setLocked(true);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0EDF9" }}>
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎁</div>
          <h1 className="text-2xl font-black" style={{ color: "#9B91BE" }}>Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Gek op Speelgoed</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Gebruikersnaam"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
            autoComplete="username"
            autoFocus
            disabled={locked}
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
            autoComplete="current-password"
            disabled={locked}
          />
          {error && (
            <p className={`text-sm ${locked ? "text-orange-500" : "text-red-500"}`}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || locked}
            className="w-full py-3 rounded-xl font-bold text-white transition-opacity disabled:opacity-60"
            style={{ background: locked ? "#aaa" : "#9B91BE" }}
          >
            {loading ? "Inloggen…" : locked ? "Geblokkeerd" : "Inloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
