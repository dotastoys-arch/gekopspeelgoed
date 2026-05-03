import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer style={{ background: "#2D2B3A" }} className="text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="font-black text-xl mb-3" style={{ color: "#9B91BE" }}>
              GEK OP <span style={{ color: "#F06060" }}>♥</span> SPEELGOED
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Verrassende speelgoedpakketten voor ieder kind. Goedkoper dan de winkel, altijd verrassing!
            </p>
            <div className="flex flex-col gap-1 text-sm text-gray-400">
              <span>📧 <a href="mailto:info@gekopspeelgoed.nl" className="hover:text-white transition-colors">info@gekopspeelgoed.nl</a></span>
              <span>🚀 Vandaag besteld = morgen verstuurd</span>
            </div>
          </div>

          {/* Pakketten */}
          <div>
            <h3 className="font-black text-sm text-gray-300 mb-4 uppercase tracking-wider">Pakketten</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/bestellen/baby-0-3-jaar" className="hover:text-white transition-colors">Baby 0–3 jaar 👶</Link></li>
              <li><Link href="/bestellen/jongens-3-5-jaar" className="hover:text-white transition-colors">Jongens 3–5 jaar 🚀</Link></li>
              <li><Link href="/bestellen/jongens-6-8-jaar" className="hover:text-white transition-colors">Jongens 6–8 jaar ⚡</Link></li>
              <li><Link href="/bestellen/meisjes-3-5-jaar" className="hover:text-white transition-colors">Meisjes 3–5 jaar 🌸</Link></li>
              <li><Link href="/bestellen/meisjes-6-8-jaar" className="hover:text-white transition-colors">Meisjes 6–8 jaar ✨</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-black text-sm text-gray-300 mb-4 uppercase tracking-wider">Informatie</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/mijn-account" className="hover:text-white transition-colors">Mijn account</Link></li>
              <li><Link href="/over-ons" className="hover:text-white transition-colors">Over ons</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/retourbeleid" className="hover:text-white transition-colors">Retourbeleid</Link></li>
              <li><Link href="/algemene-voorwaarden" className="hover:text-white transition-colors">Algemene voorwaarden</Link></li>
              <li><Link href="/privacybeleid" className="hover:text-white transition-colors">Privacybeleid</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-white/10">
          {[
            "🔒 Veilig betalen via Mollie",
            "📦 PostNL bezorging",
            "✅ 14 dagen bedenktijd",
            "⭐ 4.8 / 5 sterren",
          ].map((b) => (
            <div key={b} className="bg-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">{b}</div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Gek op Speelgoed — KVK: 12345678 — BTW: NL123456789B01</p>
          <div className="flex gap-4">
            <Link href="/privacybeleid" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/algemene-voorwaarden" className="hover:text-gray-300 transition-colors">Voorwaarden</Link>
            <Link href="/admin" className="hover:text-gray-300 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
