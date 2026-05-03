import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/facturen", label: "Facturen", icon: "📄" },
  { href: "/admin/voorraad", label: "Voorraad", icon: "📦" },
  { href: "/admin/bestellingen", label: "Bestellingen", icon: "🛒" },
  { href: "/admin/instellingen", label: "Instellingen", icon: "⚙️" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen" style={{ background: "#FAFAF9" }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#9B91BE" }}>
        <div className="px-5 pt-7 pb-6">
          <div className="text-white font-black text-lg leading-tight">
            Gek op<br />Speelgoed
          </div>
          <div className="text-white/60 text-xs mt-1">Admin</div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all text-sm font-semibold"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
