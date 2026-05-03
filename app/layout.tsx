import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GEK OP SPEELGOED — Verrassende Speelgoedpakketten voor Kinderen",
    template: "%s | GEK OP SPEELGOED",
  },
  description: "Verrassende speelgoedpakketten voor €34,95. 5–6 uniek uitgekozen speeltjes voor baby's en kinderen tot 8 jaar. Goedkoper dan de winkel!",
  metadataBase: new URL("https://gekopspeelgoed.nl"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${nunito.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
