import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLOR, CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  baby_0_3: "Kleurrijke en zachte speeltjes om de zintuigen te prikkelen",
  boys_3_5: "Avontuurlijke speeltjes voor kleine ontdekkers",
  boys_6_8: "Uitdagende speeltjes voor grotere avonturiers",
  girls_3_5: "Speelse en creatieve cadeautjes vol kleur en fantasie",
  girls_6_8: "Creatieve en stijlvolle speeltjes voor meisjes",
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
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
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Kies een pakket passend bij de leeftijd en jouw kind krijgt 5–6 verrassende speeltjes — uniek samengesteld, nooit hetzelfde.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
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
                <span className="text-2xl font-black" style={{ color: "#9B91BE" }}>€34,95</span>
                <span
                  className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: "#9B91BE" }}
                >
                  Bestel →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-werkt-het" className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-black text-center mb-10" style={{ color: "#2D2B3A" }}>Hoe werkt het?</h2>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">1️⃣</div>
              <h3 className="font-black text-gray-700 mb-2">Kies je pakket</h3>
              <p className="text-sm text-gray-500">Kies de leeftijdscategorie die bij jouw kind past</p>
            </div>
            <div>
              <div className="text-4xl mb-3">2️⃣</div>
              <h3 className="font-black text-gray-700 mb-2">Wij stellen samen</h3>
              <p className="text-sm text-gray-500">Ons systeem selecteert 5–6 leuke speeltjes, nooit dubbel</p>
            </div>
            <div>
              <div className="text-4xl mb-3">3️⃣</div>
              <h3 className="font-black text-gray-700 mb-2">Snel bezorgd</h3>
              <p className="text-sm text-gray-500">Jouw pakket komt vlot thuis — klaar om te verrassen</p>
            </div>
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
