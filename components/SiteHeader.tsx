import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="font-black text-base sm:text-xl" style={{ color: "#9B91BE" }}>
          GEK OP <span style={{ color: "#F06060" }}>♥</span> SPEELGOED
        </Link>
        <nav className="hidden sm:flex gap-6 text-sm font-semibold text-gray-500">
          <Link href="/" className="hover:text-[#9B91BE] transition-colors">Home</Link>
          <Link href="/#pakketten" className="hover:text-[#9B91BE] transition-colors">Pakketten</Link>
          <Link href="/#hoe-werkt-het" className="hover:text-[#9B91BE] transition-colors">Hoe werkt het?</Link>
          <Link href="/contact" className="hover:text-[#9B91BE] transition-colors">Contact</Link>
        </nav>
        <Link
          href="/#pakketten"
          className="sm:hidden text-xs font-black text-white px-4 py-2 rounded-xl"
          style={{ background: "#9B91BE" }}
        >
          Bestel nu
        </Link>
      </div>
    </header>
  );
}
