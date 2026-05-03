import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gek op Speelgoed",
  description: "Verrassende speelgoedpakketten voor ieder kind",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${nunito.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
