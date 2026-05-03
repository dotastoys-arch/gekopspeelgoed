import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { existsSync } from "fs";
import { join } from "path";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Confetti from "@/components/Confetti";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLOR, CATEGORIES, CATEGORY_SLUG } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "GEK OP SPEELGOED — Verrassende Speelgoedpakketten voor Kinderen",
  description:
    "Bestel een verrassend speelgoedpakket voor €34,95. 5–6 uniek uitgekozen speeltjes voor baby's en kinderen tot 8 jaar. Goedkoper dan winkel of webshop. Gratis cadeau erbij!",
  keywords: ["speelgoed pakket", "mystery box speelgoed", "verrassingspakket kinderen", "goedkoop speelgoed", "cadeaupakket kind"],
  openGraph: {
    title: "GEK OP SPEELGOED — Verrassende Speelgoedpakketten",
    description: "5–6 verrassende speeltjes voor slechts €34,95. Goedkoper dan in de winkel of online!",
    url: "https://gekopspeelgoed.nl",
    siteName: "Gek op Speelgoed",
    locale: "nl_NL",
    type: "website",
  },
};

const CATEGORY_IMAGE: Record<Category, string> = {
  baby_0_3:  "/images/pakketten/baby-0-3-jaar.png",
  boys_3_5:  "/images/pakketten/jongens-3-5-jaar.png",
  boys_6_8:  "/images/pakketten/jongens-6-8-jaar.png",
  girls_3_5: "/images/pakketten/meisjes-3-5-jaar.png",
  girls_6_8: "/images/pakketten/meisjes-6-8-jaar.png",
};

function imageExists(src: string) {
  try {
    return existsSync(join(process.cwd(), "public", src));
  } catch {
    return false;
  }
}

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  baby_0_3: "Zachte en kleurrijke speeltjes voor de allerkleinsten",
  boys_3_5: "Avontuurlijke speeltjes voor kleine ontdekkers",
  boys_6_8: "Uitdagende speeltjes voor echte avonturiers",
  girls_3_5: "Creatieve en speelse cadeautjes vol kleur",
  girls_6_8: "Stijlvolle en creatieve speeltjes voor meisjes",
};

const schemaOrgProduct = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Verrassend Speelgoedpakket",
  description: "5–6 uniek uitgekozen speeltjes per pakket, passend bij leeftijd en geslacht.",
  brand: { "@type": "Brand", name: "Gek op Speelgoed" },
  offers: { "@type": "Offer", price: "34.95", priceCurrency: "EUR", availability: "https://schema.org/InStock", url: "https://gekopspeelgoed.nl", priceValidUntil: "2026-12-31" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "24" },
};

const schemaOrgOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gek op Speelgoed",
  url: "https://gekopspeelgoed.nl",
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "info@gekopspeelgoed.nl", availableLanguage: "Dutch" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgProduct) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgOrg) }} />

      <SiteHeader />

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #EDE9F8 0%, #FDE8E8 50%, #E8F8EE 100%)" }} className="relative px-4 sm:px-6 pt-12 pb-14 sm:pt-20 sm:pb-20 text-center overflow-hidden">
        <Confetti />
        <div className="relative z-10">
        <div className="text-6xl sm:text-7xl mb-5 animate-bounce" style={{ animationDuration: "2s" }}>🎁</div>
        <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight" style={{ color: "#2D2B3A" }}>
          Verrassingspakket <br className="sm:hidden" />
          <span style={{ color: "#9B91BE" }}>vol speelgoed!</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto mb-6 leading-relaxed">
          5–6 speeltjes uitgekozen voor jouw kind — nooit hetzelfde, altijd verrassing!
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          {[
            { icon: "🏷️", text: "Beste prijs" },
            { icon: "🚀", text: "Morgen verstuurd" },
            { icon: "🎁", text: "Gratis cadeau" },
            { icon: "⭐", text: "4.8 / 5 sterren" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm">
              <span>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        <Link href="#pakketten"
          className="inline-block text-white font-black text-base sm:text-lg px-8 sm:px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #9B91BE, #7B6FAE)" }}>
          🎉 Kies jouw pakket →
        </Link>
        <p className="text-xs text-gray-400 mt-3">Vandaag besteld = morgen verstuurd</p>
        </div>
      </section>

      {/* Packages */}
      <section id="pakketten" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: "#2D2B3A" }}>Kies jouw pakket</h2>
          <p className="text-sm text-gray-400">Welke leeftijd past het beste?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => {
            const imgSrc = CATEGORY_IMAGE[cat];
            const hasImage = imageExists(imgSrc);
            return (
              <Link
                key={cat}
                href={`/bestellen/${CATEGORY_SLUG[cat]}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
              >
                {hasImage ? (
                  <div className="relative w-full h-44 flex-shrink-0 overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={CATEGORY_LABELS[cat]}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 50%, white 100%)` }} />
                  </div>
                ) : (
                  <div className="h-2 w-full flex-shrink-0" style={{ background: CATEGORY_COLOR[cat] }} />
                )}

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {!hasImage && (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 flex-shrink-0"
                      style={{ background: CATEGORY_COLOR[cat] + "25" }}
                    >
                      {CATEGORY_EMOJI[cat]}
                    </div>
                  )}
                  <h3 className="font-black text-gray-800 text-lg mb-1">{CATEGORY_LABELS[cat]}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1">{CATEGORY_DESCRIPTIONS[cat]}</p>
                  <div className="flex items-center justify-between mt-5">
                    <div>
                      <div className="text-2xl font-black" style={{ color: "#9B91BE" }}>€34,95</div>
                      <div className="text-xs text-green-600 font-semibold mt-0.5">🏷️ Beste prijs</div>
                    </div>
                    <span
                      className="text-sm font-black px-5 py-2.5 rounded-xl text-white group-hover:opacity-90 transition-opacity"
                      style={{ background: CATEGORY_COLOR[cat] }}
                    >
                      Bestel →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-3xl p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #FFF9E6, #FFF0F0)" }}>
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">⭐⭐⭐⭐⭐</div>
            <h2 className="text-xl sm:text-2xl font-black mb-1" style={{ color: "#2D2B3A" }}>Ouders zijn enthousiast!</h2>
            <p className="text-sm text-gray-400">Gemiddeld 4.8 / 5 sterren</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Lisa M.", text: "\"Mijn dochter was helemaal in de wolken! Super leuke speeltjes voor een geweldige prijs.\"", emoji: "🌸" },
              { name: "Jeroen K.", text: "\"Echt goedkoper dan de winkel. En de verrassing maakt het extra leuk voor de kinderen!\"", emoji: "🚀" },
              { name: "Femke B.", text: "\"Voor het tweede jaar op rij besteld. Altijd andere speeltjes, nooit teleurgesteld!\"", emoji: "✨" },
            ].map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-4 sm:p-5">
                <div className="text-2xl mb-2">{r.emoji}</div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3 italic">{r.text}</p>
                <div className="text-xs font-bold text-gray-400">{r.name} · ⭐⭐⭐⭐⭐</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price comparison */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-3xl p-6 sm:p-8 text-center" style={{ background: "linear-gradient(135deg, #EDE9F8, #E8F8EE)" }}>
          <div className="text-3xl mb-3">💰</div>
          <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: "#2D2B3A" }}>Goedkoper dan de winkel, altijd!</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Wij kopen in bulk en geven die besparing direct aan jou door.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto">
            <div className="bg-white rounded-2xl p-3 sm:p-4">
              <div className="text-xs text-gray-400 mb-1">Supermarkt</div>
              <div className="text-base sm:text-lg font-black text-gray-300 line-through">€60–80</div>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 shadow-md" style={{ borderColor: "#9B91BE" }}>
              <div className="text-xs font-black mb-1" style={{ color: "#9B91BE" }}>Wij</div>
              <div className="text-base sm:text-xl font-black" style={{ color: "#9B91BE" }}>€34,95</div>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-4">
              <div className="text-xs text-gray-400 mb-1">Speelgoedwinkel</div>
              <div className="text-base sm:text-lg font-black text-gray-300 line-through">€50–70</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-werkt-het" className="bg-white border-t border-b border-gray-100 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: "#2D2B3A" }}>Hoe werkt het?</h2>
            <p className="text-sm text-gray-400">In 4 stappen naar jouw mystery box</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { num: 1, color: "#5B8DEF", icon: "👆", title: "Kies categorie", sub: "Leeftijd & geslacht" },
              { num: 2, color: "#F4924A", icon: "📝", title: "Vul gegevens in", sub: "Naam & adres" },
              { num: 3, color: "#E85D9C", icon: "🎁", title: "Gratis cadeau", sub: "Kies een extraatje" },
              { num: 4, color: "#4DC97E", icon: "🎉", title: "Uitpakken!", sub: "Geniet & verras" },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center">
                <div className="relative mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-md"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-black text-white shadow"
                    style={{ background: step.color, filter: "brightness(0.8)" }}>
                    {step.num}
                  </div>
                </div>
                <h3 className="font-black text-gray-700 mb-0.5 text-xs sm:text-sm">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-snug">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="rounded-3xl p-8 sm:p-12" style={{ background: "linear-gradient(135deg, #9B91BE, #7B6FAE)" }}>
          <div className="text-4xl sm:text-5xl mb-4">🛒</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Klaar om te verrassen?</h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-sm mx-auto">
            Bestel vandaag en morgen ligt het al bij de brievenbus!
          </p>
          <Link href="#pakketten"
            className="inline-block bg-white font-black text-base sm:text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
            style={{ color: "#9B91BE" }}>
            🎁 Kies jouw pakket →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
