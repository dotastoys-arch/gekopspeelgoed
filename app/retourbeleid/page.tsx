import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Retourbeleid", description: "Retour- en ruilbeleid van Gek op Speelgoed." };

export default function RetourbeleidPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <div className="text-5xl mb-6 text-center">📦</div>
        <h1 className="text-3xl sm:text-4xl font-black text-center mb-8" style={{ color: "#2D2B3A" }}>Retourbeleid</h1>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-gray-600 leading-relaxed">
          <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: "#F0FDF4" }}>
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-black text-green-700 mb-1">14 dagen bedenktijd</div>
              <p className="text-sm text-green-600">Je hebt 14 dagen na ontvangst om een bestelling te retourneren, zonder opgave van reden.</p>
            </div>
          </div>

          <div>
            <h2 className="font-black text-gray-800 mb-3">Hoe werkt retourneren?</h2>
            <ol className="space-y-3 text-sm">
              {[
                "Stuur een e-mail naar dotastoys@gmail.com met je bestelnummer en de reden van retour.",
                "Je ontvangt van ons de retourinstructies per e-mail.",
                "Stuur de producten ongebruikt en in originele verpakking retour.",
                "Na ontvangst en controle vergoeden wij het aankoopbedrag binnen 14 dagen.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: "#9B91BE" }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-black text-gray-800 mb-2">Retourkosten</h2>
            <p className="text-sm">Retourkosten zijn voor rekening van de klant, tenzij het product defect of incorrect geleverd is. In dat geval vergoeden wij de retourkosten volledig.</p>
          </div>

          <div>
            <h2 className="font-black text-gray-800 mb-2">Defecte producten</h2>
            <p className="text-sm">Ontvang je een defect product? Neem dan binnen 7 dagen contact met ons op via <a href="mailto:dotastoys@gmail.com" className="font-semibold" style={{ color: "#9B91BE" }}>dotastoys@gmail.com</a> met een foto van het defect. Wij lossen het kosteloos op.</p>
          </div>

          <div>
            <h2 className="font-black text-gray-800 mb-2">Verrassingspakketten</h2>
            <p className="text-sm">Omdat onze pakketten een verrassing zijn, is de inhoud niet op voorhand bekend. Dit is geen reden voor retour. Wel kun je altijd contact opnemen als je ontevreden bent — we helpen je graag.</p>
          </div>

          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            <p>Vragen? <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#9B91BE" }}>Neem contact op</Link>.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
