import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Privacybeleid", description: "Privacybeleid van Gek op Speelgoed." };

const sections = [
  {
    title: "1. Wie zijn wij?",
    content: "Gek op Speelgoed is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit privacybeleid. Vragen? Neem contact op via onze contactpagina.",
  },
  {
    title: "2. Welke gegevens verwerken wij?",
    content: "Wij verwerken de volgende persoonsgegevens: naam, e-mailadres, bezorgadres (straat, huisnummer, postcode, stad). Deze gegevens zijn noodzakelijk voor het uitvoeren van jouw bestelling.",
  },
  {
    title: "3. Waarvoor gebruiken wij jouw gegevens?",
    content: "Jouw gegevens worden gebruikt voor: het verwerken en bezorgen van jouw bestelling, het versturen van een bevestiging per e-mail, en het contact opnemen bij vragen over jouw bestelling. Met jouw toestemming kunnen we je ook informeren over aanbiedingen.",
  },
  {
    title: "4. Bewaartermijn",
    content: "Wij bewaren jouw persoonsgegevens niet langer dan noodzakelijk. Bestelgegevens worden maximaal 7 jaar bewaard conform de wettelijke bewaarplicht voor administratie.",
  },
  {
    title: "5. Delen met derden",
    content: "Wij verkopen jouw gegevens nooit aan derden. Wij delen gegevens alleen met PostNL voor bezorging en Mollie voor betalingsverwerking. Beide partijen verwerken gegevens conform de AVG.",
  },
  {
    title: "6. Cookies",
    content: "Wij gebruiken alleen functionele cookies die noodzakelijk zijn voor het functioneren van de website. Er worden geen tracking- of marketingcookies geplaatst zonder jouw toestemming.",
  },
  {
    title: "7. Jouw rechten",
    content: "Je hebt het recht op inzage, correctie of verwijdering van jouw persoonsgegevens. Neem hiervoor contact met ons op via onze contactpagina. Wij reageren binnen 30 dagen.",
  },
  {
    title: "8. Beveiliging",
    content: "Wij nemen passende technische en organisatorische maatregelen om jouw gegevens te beschermen tegen ongeautoriseerde toegang, verlies of misbruik.",
  },
  {
    title: "9. Klachten",
    content: "Ben je niet tevreden over hoe wij met jouw gegevens omgaan? Je kunt een klacht indienen bij de Autoriteit Persoonsgegevens via www.autoriteitpersoonsgegevens.nl.",
  },
];

export default function PrivacybeleidPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "#2D2B3A" }}>Privacybeleid</h1>
        <p className="text-sm text-gray-400 mb-8">Laatst bijgewerkt: mei 2026 · AVG-conform</p>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-black text-gray-800 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            <p>Vragen over privacy? <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#9B91BE" }}>Neem contact op</Link>.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
