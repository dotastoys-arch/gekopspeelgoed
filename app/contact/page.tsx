"use client";

import { useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <div className="text-5xl mb-6 text-center">💬</div>
        <h1 className="text-3xl sm:text-4xl font-black text-center mb-8" style={{ color: "#2D2B3A" }}>Contact</h1>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm mb-6">
          <p className="text-gray-600 mb-8 leading-relaxed">
            Heb je een vraag of opmerking? Vul het formulier in en we reageren binnen 1 werkdag.
          </p>

          {state === "success" ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "#F0FDF4" }}>
              <div className="text-4xl mb-3">✅</div>
              <p className="font-black text-green-800 text-lg mb-1">Bericht verzonden!</p>
              <p className="text-green-700 text-sm">We nemen zo snel mogelijk contact met je op.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Naam</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jouw naam"
                    className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">E-mailadres</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="jouw@email.nl"
                    className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Onderwerp</label>
                <select
                  required
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
                  style={{ borderColor: "#E5E7EB", color: form.subject ? "#111827" : "#9CA3AF" }}
                >
                  <option value="" disabled>Kies een onderwerp</option>
                  <option value="Vraag over mijn bestelling">Vraag over mijn bestelling</option>
                  <option value="Retour aanvragen">Retour aanvragen</option>
                  <option value="Vraag over een pakket">Vraag over een pakket</option>
                  <option value="Klacht">Klacht</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bericht</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Typ hier je bericht..."
                  className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors resize-none"
                  style={{ borderColor: "#E5E7EB" }}
                />
              </div>

              {state === "error" && (
                <p className="text-red-500 text-sm">Er ging iets mis. Probeer het opnieuw of mail ons direct op <a href="mailto:info@gekopspeelgoed.nl" className="underline">info@gekopspeelgoed.nl</a>.</p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-opacity disabled:opacity-60"
                style={{ background: "#9B91BE" }}
              >
                {state === "loading" ? "Versturen..." : "Verstuur bericht"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-black text-gray-700 mb-4">Veelgestelde vragen</h2>
          <div className="space-y-3">
            {[
              { q: "Wanneer ontvang ik mijn pakket?", a: "Vandaag besteld? Dan versturen we morgen. Bezorging via PostNL duurt 1–2 werkdagen." },
              { q: "Wat zit er in het pakket?", a: "Elk pakket bevat 5–6 speeltjes, speciaal uitgekozen voor de leeftijd en het geslacht. Het is een verrassing!" },
              { q: "Kan ik retourneren?", a: "Ja, je hebt 14 dagen bedenktijd. Bekijk ons retourbeleid voor meer informatie." },
              { q: "Hoe betaal ik?", a: "Veilig via Mollie: iDEAL, creditcard, Bancontact en meer." },
            ].map((faq) => (
              <details key={faq.q} className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                <summary className="font-semibold text-sm text-gray-700">{faq.q}</summary>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
