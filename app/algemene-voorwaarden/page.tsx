import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Algemene Voorwaarden", description: "Algemene voorwaarden van Gek op Speelgoed." };

const sections = [
  {
    title: "1. Algemeen",
    content: "Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, bestellingen en overeenkomsten van Gek op Speelgoed. Door een bestelling te plaatsen ga je akkoord met deze voorwaarden.",
  },
  {
    title: "2. Prijzen",
    content: "Alle prijzen zijn in euro's inclusief BTW. Gek op Speelgoed behoudt zich het recht voor om prijzen te wijzigen. De prijs die geldt is de prijs die vermeld stond op het moment van bestellen.",
  },
  {
    title: "3. Bestellingen",
    content: "Een bestelling komt tot stand na betaling via ons betaalsysteem (Mollie). Je ontvangt een bevestiging per e-mail na een geslaagde betaling.",
  },
  {
    title: "4. Levering",
    content: "Bestellingen worden op werkdagen verwerkt. Bij bestelling voor 17:00 wordt er de volgende werkdag verstuurd via PostNL. Wij zijn niet aansprakelijk voor vertragingen door PostNL.",
  },
  {
    title: "5. Herroepingsrecht",
    content: "Je hebt het recht om een bestelling binnen 14 dagen na ontvangst te herroepen, zonder opgave van reden. Producten dienen ongebruikt en in originele verpakking geretourneerd te worden. Retourkosten zijn voor de klant.",
  },
  {
    title: "6. Garantie",
    content: "Op alle producten geldt de wettelijke garantie. Als een product defect is, neem dan contact op via dotastoys@gmail.com.",
  },
  {
    title: "7. Privacy",
    content: "Wij verwerken persoonsgegevens conform ons privacybeleid. Gegevens worden nooit aan derden verkocht.",
  },
  {
    title: "8. Klachten",
    content: "Klachten kunnen ingediend worden via dotastoys@gmail.com. We streven ernaar klachten binnen 5 werkdagen te beantwoorden.",
  },
  {
    title: "9. Toepasselijk recht",
    content: "Op alle overeenkomsten is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.",
  },
];

export default function AlgemeneVoorwaardenPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "#2D2B3A" }}>Algemene voorwaarden</h1>
        <p className="text-sm text-gray-400 mb-8">Laatst bijgewerkt: mei 2026 · Gek op Speelgoed</p>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-black text-gray-800 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            <p>Vragen over onze voorwaarden? Neem <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#9B91BE" }}>contact</Link> op.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
