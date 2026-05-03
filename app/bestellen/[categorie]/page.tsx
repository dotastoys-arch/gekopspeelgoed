"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLOR } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

interface GiftProduct {
  id: number;
  name: string;
  imageUrl: string | null;
}

export default function BestelPage({ params }: { params: Promise<{ categorie: Category }> }) {
  const router = useRouter();
  const [cat, setCat] = useState<Category | null>(null);
  const [step, setStep] = useState<"form" | "cadeau">("form");
  const [form, setForm] = useState({ name: "", email: "", address: "", postalCode: "", city: "" });
  const [gifts, setGifts] = useState<GiftProduct[]>([]);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setCat(p.categorie));
    fetch("/api/cadeaus").then((r) => r.json()).then(setGifts).catch(() => {});
  }, [params]);

  if (!cat) return null;

  const label = CATEGORY_LABELS[cat];
  const emoji = CATEGORY_EMOJI[cat];
  const color = CATEGORY_COLOR[cat];

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (gifts.length > 0) {
      setStep("cadeau");
    } else {
      submitOrder(null);
    }
  }

  async function submitOrder(giftProductId: number | null) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/bestellingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, ...form, giftProductId }),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      if (data.mollieUrl) {
        window.location.href = data.mollieUrl;
      } else {
        router.push(`/bestelling-bevestigd?orderId=${data.orderId}`);
      }
    } else {
      const err = await res.json();
      setError(err.error ?? "Er ging iets mis. Probeer het opnieuw.");
      setStep("form");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => step === "cadeau" ? setStep("form") : router.push("/")}
            className="text-sm font-semibold text-gray-400 hover:text-[#9B91BE]"
          >
            ← Terug
          </button>
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

        {/* Step indicator (only when gifts available) */}
        {gifts.length > 0 && (
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: step === "form" ? "#9B91BE" : "#D1FAE5" }}
              >
                {step === "form" ? "1" : "✓"}
              </div>
              <span className={`text-sm font-semibold ${step === "form" ? "text-gray-700" : "text-green-600"}`}>Gegevens</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: step === "cadeau" ? "#F06060" : "#E5E7EB" }}
              >
                2
              </div>
              <span className={`text-sm font-semibold ${step === "cadeau" ? "text-gray-700" : "text-gray-400"}`}>Gratis cadeau</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white bg-gray-200">
                3
              </div>
              <span className="text-sm font-semibold text-gray-400">Betalen</span>
            </div>
          </div>
        )}

        {/* STEP 1: Form */}
        {step === "form" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-black text-gray-700 text-lg mb-6">Jouw gegevens</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Naam *">
                  <input type="text" placeholder="Voor- en achternaam" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
                </FormField>
                <FormField label="E-mailadres *">
                  <input type="email" placeholder="jouw@email.nl" required value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
                </FormField>
              </div>
              <FormField label="Straat + huisnummer *">
                <input type="text" placeholder="Voorbeeldstraat 12" required value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="input-field" />
              </FormField>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Postcode *">
                  <input type="text" placeholder="1234 AB" required value={form.postalCode}
                    onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} className="input-field" />
                </FormField>
                <div className="col-span-2">
                  <FormField label="Stad *">
                    <input type="text" placeholder="Amsterdam" required value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-field" />
                  </FormField>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 mt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-black text-white text-lg transition-opacity"
                  style={{ background: "#9B91BE" }}
                >
                  {gifts.length > 0 ? "Volgende: kies je cadeau →" : "🎁 Bestel nu — €34,95"}
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  Je betaalt veilig via Mollie. Na betaling ontvang je een bevestiging per e-mail.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Gift selection */}
        {step === "cadeau" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🎁</div>
              <h2 className="font-black text-gray-700 text-xl mb-2">Kies jouw gratis cadeau!</h2>
              <p className="text-sm text-gray-400">Selecteer één extraatje dat we gratis toevoegen aan jouw pakket</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {/* No gift option */}
              <button
                onClick={() => setSelectedGift(null)}
                className="rounded-2xl p-4 border-2 text-center transition-all"
                style={selectedGift === null
                  ? { borderColor: "#9B91BE", background: "#9B91BE15" }
                  : { borderColor: "#E5E7EB", background: "#fff" }}
              >
                <div className="text-3xl mb-2">🙈</div>
                <div className="text-xs font-bold text-gray-600">Geen cadeau</div>
                <div className="text-xs text-gray-400">Verrassing volledig</div>
              </button>

              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => setSelectedGift(gift.id)}
                  className="rounded-2xl p-4 border-2 text-center transition-all"
                  style={selectedGift === gift.id
                    ? { borderColor: "#F06060", background: "#F0606015" }
                    : { borderColor: "#E5E7EB", background: "#fff" }}
                >
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="w-16 h-16 object-contain mx-auto mb-2 rounded-xl" />
                  ) : (
                    <div className="text-3xl mb-2">🧸</div>
                  )}
                  <div className="text-xs font-bold text-gray-700 leading-tight line-clamp-2">{gift.name}</div>
                  <div className="text-xs mt-1 font-bold" style={{ color: "#4DC97E" }}>GRATIS</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm font-semibold mb-4" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                ⚠️ {error}
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                <span>Pakket {label}</span>
                <span className="font-bold text-gray-700">€34,95</span>
              </div>
              {selectedGift !== null && (
                <div className="flex items-center justify-between mb-4 text-sm" style={{ color: "#4DC97E" }}>
                  <span className="font-semibold">🎁 {gifts.find(g => g.id === selectedGift)?.name}</span>
                  <span className="font-bold">GRATIS</span>
                </div>
              )}
              <button
                onClick={() => submitOrder(selectedGift)}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-white text-lg disabled:opacity-60 transition-opacity"
                style={{ background: "#F06060" }}
              >
                {loading ? "Bestelling aanmaken…" : "🎁 Bestel nu — €34,95"}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                Je betaalt veilig via Mollie. Na betaling ontvang je een bevestiging per e-mail.
              </p>
            </div>
          </div>
        )}
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}
