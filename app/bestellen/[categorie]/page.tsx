"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLOR } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

export default function BestelPage({ params }: { params: Promise<{ categorie: Category }> }) {
  const router = useRouter();
  const [cat, setCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", email: "", address: "", postalCode: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get params
  if (!cat) {
    params.then((p) => setCat(p.categorie));
    return null;
  }

  const label = CATEGORY_LABELS[cat];
  const emoji = CATEGORY_EMOJI[cat];
  const color = CATEGORY_COLOR[cat];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/bestellingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, ...form }),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      // Redirect to Mollie payment page
      if (data.mollieUrl) {
        window.location.href = data.mollieUrl;
      } else {
        router.push(`/bestelling-bevestigd?orderId=${data.orderId}`);
      }
    } else {
      setLoading(false);
      const err = await res.json();
      setError(err.error ?? "Er ging iets mis. Probeer het opnieuw.");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-gray-400 hover:text-[#9B91BE]">← Terug</Link>
          <div className="flex-1 text-center">
            <span className="text-lg font-black" style={{ color: "#9B91BE" }}>GEK OP ♥ SPEELGOED</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Package header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: color + "30" }}
          >
            {emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-800">{label}</h1>
            <p className="text-sm text-gray-500">5–6 verrassende speeltjes · uniek samengesteld · snel bezorgd</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: "#9B91BE" }}>€34,95</div>
            <div className="text-xs text-gray-400">incl. BTW + verzending</div>
          </div>
        </div>

        {/* Order form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="font-black text-gray-700 text-lg mb-6">Jouw gegevens</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Naam *" required>
                <input
                  type="text"
                  placeholder="Voor- en achternaam"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field"
                />
              </FormField>
              <FormField label="E-mailadres *" required>
                <input
                  type="email"
                  placeholder="jouw@email.nl"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field"
                />
              </FormField>
            </div>
            <FormField label="Straat + huisnummer *" required>
              <input
                type="text"
                placeholder="Voorbeeldstraat 12"
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="input-field"
              />
            </FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Postcode *" required>
                <input
                  type="text"
                  placeholder="1234 AB"
                  required
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                  className="input-field"
                />
              </FormField>
              <div className="col-span-2">
                <FormField label="Stad *" required>
                  <input
                    type="text"
                    placeholder="Amsterdam"
                    required
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="input-field"
                  />
                </FormField>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                ⚠️ {error}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 mt-4">
              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <span>Pakket {label}</span>
                <span className="font-bold text-gray-700">€34,95</span>
              </div>
              <div className="flex items-center justify-between mb-6 text-sm text-gray-400">
                <span>Verzending (inbegrepen)</span>
                <span>€4,95</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-white text-lg disabled:opacity-60 transition-opacity"
                style={{ background: "#9B91BE" }}
              >
                {loading ? "Bestelling aanmaken…" : `🎁 Bestel nu — €34,95`}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                Je betaalt veilig via Mollie. Na betaling ontvang je een bevestiging per e-mail.
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #9B91BE; }
      `}</style>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}
