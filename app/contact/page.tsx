import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Contact", description: "Neem contact op met Gek op Speelgoed." };

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        <div className="text-5xl mb-6 text-center">💬</div>
        <h1 className="text-3xl sm:text-4xl font-black text-center mb-8" style={{ color: "#2D2B3A" }}>Contact</h1>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm">
          <p className="text-gray-600 mb-8 leading-relaxed">
            Heb je een vraag, opmerking of wil je meer informatie? Stuur ons een e-mail en we reageren zo snel mogelijk — meestal binnen 1 werkdag.
          </p>

          <div className="space-y-4 mb-8">
            <a href="mailto:dotastoys@gmail.com"
              className="flex items-center gap-4 p-4 rounded-2xl border-2 hover:border-[#9B91BE] transition-colors"
              style={{ borderColor: "#E5E7EB" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: "#EDE9F8" }}>📧</div>
              <div>
                <div className="font-black text-gray-800">E-mail</div>
                <div className="text-sm text-gray-500">dotastoys@gmail.com</div>
              </div>
            </a>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#F9FAFB" }}>
            <h2 className="font-black text-gray-700 mb-3">Veelgestelde vragen</h2>
            <div className="space-y-3">
              {[
                { q: "Wanneer ontvang ik mijn pakket?", a: "Vandaag besteld? Dan versturen we morgen. Bezorging via PostNL duurt 1–2 werkdagen." },
                { q: "Wat zit er in het pakket?", a: "Elk pakket bevat 5–6 speeltjes, speciaal uitgekozen voor de leeftijd en het geslacht. Het is een verrassing!" },
                { q: "Kan ik retourneren?", a: "Ja, je hebt 14 dagen bedenktijd. Bekijk ons retourbeleid voor meer informatie." },
                { q: "Hoe betaal ik?", a: "Veilig via Mollie: iDEAL, creditcard, Bancontact en meer." },
              ].map((faq) => (
                <details key={faq.q} className="bg-white rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-sm text-gray-700">{faq.q}</summary>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
