import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Over ons", description: "Ontdek het verhaal achter Gek op Speelgoed." };

export default function OverOnsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <div className="text-5xl mb-6 text-center">🎁</div>
        <h1 className="text-3xl sm:text-4xl font-black text-center mb-8" style={{ color: "#2D2B3A" }}>Over ons</h1>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-gray-600 leading-relaxed">
          <div>
            <h2 className="font-black text-lg text-gray-800 mb-2">Ons verhaal</h2>
            <p>
              Gek op Speelgoed is ontstaan vanuit een eenvoudig idee: kinderen verdienen leuk, kwalitatief speelgoed zonder dat ouders daar de hoofdprijs voor hoeven te betalen. Wij kopen speelgoed in grote hoeveelheden in, waardoor we de beste prijzen kunnen bieden.
            </p>
          </div>
          <div>
            <h2 className="font-black text-lg text-gray-800 mb-2">Wat wij doen</h2>
            <p>
              Wij stellen verrassende speelgoedpakketten samen, speciaal afgestemd op de leeftijd en het geslacht van jouw kind. Elk pakket bevat 5 à 6 speeltjes — nooit hetzelfde, altijd een verrassing. En voor een prijs die je nergens anders vindt.
            </p>
          </div>
          <div>
            <h2 className="font-black text-lg text-gray-800 mb-2">Onze belofte</h2>
            <ul className="space-y-2">
              {[
                "🏷️ Altijd goedkoper dan in de winkel",
                "🎁 Elk pakket uniek samengesteld",
                "🚀 Vandaag besteld = morgen verstuurd",
                "✅ 14 dagen bedenktijd",
                "💬 Altijd persoonlijk contact mogelijk",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">{item}</li>
              ))}
            </ul>
          </div>
          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            <p>Vragen? Neem gerust <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#9B91BE" }}>contact</Link> met ons op!</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
