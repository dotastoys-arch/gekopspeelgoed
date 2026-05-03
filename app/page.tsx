import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLOR, CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "GEK OP SPEELGOED — Verrassende Speelgoedpakketten voor Kinderen",
  description:
    "Bestel een verrassend speelgoedpakket voor €34,95. 5–6 uniek uitgekozen speeltjes voor baby's en kinderen tot 8 jaar. Goedkoper dan winkel of webshop. Gratis cadeau erbij!",
  keywords: [
    "speelgoed pakket",
    "mystery box speelgoed",
    "verrassingspakket kinderen",
    "goedkoop speelgoed",
    "cadeaupakket kind",
    "speelgoed baby",
    "speelgoed jongens meisjes",
  ],
  openGraph: {
    title: "GEK OP SPEELGOED — Verrassende Speelgoedpakketten",
    description: "5–6 verrassende speeltjes voor slechts €34,95. Goedkoper dan in de winkel of online!",
    url: "https://gekopspeelgoed.nl",
    siteName: "Gek op Speelgoed",
    locale: "nl_NL",
    type: "website",
  },
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  baby_0_3: "Kleurrijke en zachte speeltjes om de zintuigen te prikkelen",
  boys_3_5: "Avontuurlijke speeltjes voor kleine ontdekkers",
  boys_6_8: "Uitdagende speeltjes voor grotere avonturiers",
  girls_3_5: "Speelse en creatieve cadeautjes vol kleur en fantasie",
  girls_6_8: "Creatieve en stijlvolle speeltjes voor meisjes",
};

const schemaOrgProduct = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Verrassend Speelgoedpakket",
  description: "5–6 uniek uitgekozen speeltjes per pakket, passend bij leeftijd en geslacht. Goedkoper dan in de winkel!",
  brand: { "@type": "Brand", name: "Gek op Speelgoed" },
  offers: {
    "@type": "Offer",
    price: "34.95",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: "https://gekopspeelgoed.nl",
    priceValidUntil: "2026-12-31",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "24",
  },
};

const schemaOrgOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gek op Speelgoed",
  url: "https://gekopspeelgoed.nl",
  logo: "https://gekopspeelgoed.nl/logo.png",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "dotastoys@gmail.com",
    availableLanguage: "Dutch",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgOrg) }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-black" style={{ color: "#9B91BE" }}>GEK OP</span>
            {" "}
            <span style={{ color: "#F06060" }}>♥</span>
            {" "}
            <span className="text-xl font-black" style={{ color: "#9B91BE" }}>SPEELGOED</span>
          </div>
          <nav className="flex gap-6 text-sm font-semibold text-gray-500">
            <Link href="#pakketten" className="hover:text-[#9B91BE] transition-colors">Pakketten</Link>
            <Link href="#hoe-werkt-het" className="hover:text-[#9B91BE] transition-colors">Hoe werkt het?</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="text-5xl mb-4">🎁</div>
        <h1 className="text-4xl font-black mb-4" style={{ color: "#9B91BE" }}>
          Verrassende speelgoedpakketten
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-6">
          Kies een pakket passend bij de leeftijd en jouw kind krijgt 5–6 verrassende speeltjes — uniek samengesteld, nooit hetzelfde.
        </p>

        {/* Price claim banner */}
        <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 mb-8 text-sm font-bold"
          style={{ background: "#FEF9C3", color: "#92400E", border: "1.5px solid #FDE68A" }}>
          🏷️ Goedkoper dan in de winkel of online — Wij hebben de beste prijzen!
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
          <span>✅ 5–6 speeltjes per pakket</span>
          <span>🚀 Snel verzonden</span>
          <span>🎁 Altijd verrassing</span>
          <span>♥ Nooit hetzelfde</span>
        </div>
      </section>

      {/* Packages */}
      <section id="pakketten" className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black text-center mb-8" style={{ color: "#2D2B3A" }}>Kies een pakket</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/bestellen/${cat}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border border-transparent hover:border-[#9B91BE]/20 block"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: CATEGORY_COLOR[cat] + "30" }}
              >
                {CATEGORY_EMOJI[cat]}
              </div>
              <h3 className="font-black text-gray-800 text-lg">{CATEGORY_LABELS[cat]}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">{CATEGORY_DESCRIPTIONS[cat]}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black" style={{ color: "#9B91BE" }}>€34,95</div>
                  <div className="text-xs text-green-600 font-semibold">Beste prijs garantie 🏷️</div>
                </div>
                <span className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ background: "#9B91BE" }}>
                  Bestel →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Price comparison */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg, #9B91BE15, #F0606015)" }}>
          <div className="text-3xl mb-3">💰</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: "#2D2B3A" }}>Goedkoper dan de winkel, altijd!</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">
            Wij kopen speelgoed in bulk in en geven die besparing direct aan jou door.
            Voor €34,95 krijg je speeltjes die in de winkel of online samen twee keer zoveel kosten.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Supermarkt</div>
              <div className="text-lg font-black text-gray-400 line-through">€60–80</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border-2" style={{ borderColor: "#9B91BE" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "#9B91BE" }}>GEK OP SPEELGOED</div>
              <div className="text-lg font-black" style={{ color: "#9B91BE" }}>€34,95</div>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Speelgoedwinkel</div>
              <div className="text-lg font-black text-gray-400 line-through">€50–70</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-werkt-het" className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-2" style={{ color: "#2D2B3A" }}>Hoe werkt het?</h2>
          <p className="text-center text-gray-400 mb-12 text-sm">In 4 simpele stappen naar jouw mystery box!</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { num: 1, color: "#5B8DEF", icon: "👆", title: "Kies je categorie", sub: "Selecteer leeftijd en geslacht" },
              { num: 2, color: "#F4924A", icon: "📦", title: "Vul je gegevens in", sub: "Naam, e-mail en adres" },
              { num: 3, color: "#E85D9C", icon: "🎁", title: "Gratis cadeau", sub: "Kies een extraatje erbij" },
              { num: 4, color: "#4DC97E", icon: "🎉", title: "Uitpakken!", sub: "Geniet van de verrassing" },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md"
                    style={{ background: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shadow"
                    style={{ background: step.color, filter: "brightness(0.85)" }}
                  >
                    {step.num}
                  </div>
                </div>
                <h3 className="font-black text-gray-700 mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-400">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Gek op Speelgoed · <Link href="/admin" className="hover:text-[#9B91BE]">Admin</Link></p>
      </footer>
    </div>
  );
}
