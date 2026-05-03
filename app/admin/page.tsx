import { db } from "@/lib/db";
import { products, inventory, orders, packageConfigs } from "@/lib/db/schema";
import { eq, lt, and, count, sum } from "drizzle-orm";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORIES, formatEuro } from "@/lib/categories";
import { calculateViability } from "@/lib/packages/engine";
import type { Category } from "@/lib/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalProducts] = await db.select({ count: count() }).from(products).where(eq(products.isActive, true));
  const [pendingOrders] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
  const [totalOrdersRow] = await db.select({ count: count() }).from(orders);

  // Low-stock warnings (< 5 stuks)
  const lowStock = await db
    .select({ id: inventory.id, productId: inventory.productId, quantity: inventory.quantity, name: products.name })
    .from(inventory)
    .innerJoin(products, eq(products.id, inventory.productId))
    .where(and(lt(inventory.quantity, 5), eq(products.isActive, true)));

  const lowStockFiltered = lowStock.filter((s) => s.quantity > 0);
  const outOfStock = lowStock.filter((s) => s.quantity === 0).length;

  // Recent orders
  const recentOrders = await db.query.orders.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit: 5,
    with: { customer: true },
  });

  // Package viability per category
  const viability = await Promise.all(
    CATEGORIES.map(async (cat) => {
      try {
        const v = await calculateViability(cat as Category);
        return { category: cat as Category, ...v };
      } catch {
        return { category: cat as Category, totalProducts: 0, totalStock: 0, estimatedPackages: 0, maxPurchaseBudget: 0, avgPurchaseCost: 0 };
      }
    })
  );

  const totalEstimated = viability.reduce((s, v) => s + v.estimatedPackages, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black mb-1" style={{ color: "#9B91BE" }}>Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Overzicht van je voorraad en pakketten</p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon="📦" label="Producten" value={String(totalProducts.count)} color="#9B91BE" />
        <StatCard icon="🎁" label="Mogelijke pakketten" value={String(totalEstimated)} color="#4ECDC4" />
        <StatCard icon="🛒" label="Open bestellingen" value={String(pendingOrders.count)} color="#F06060" />
        <StatCard icon="⚠️" label="Bijna uitverkocht" value={String(lowStockFiltered.length)} color="#FFD166" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Package viability per category */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-gray-700 mb-4">Pakket-mogelijkheden per categorie</h2>
          <div className="space-y-3">
            {viability.map((v) => (
              <div key={v.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_EMOJI[v.category]}</span>
                  <span className="text-sm font-semibold text-gray-600">{CATEGORY_LABELS[v.category]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{v.totalProducts} producten · {v.totalStock} stuks</span>
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      background: v.estimatedPackages === 0 ? "#FEE2E2" : "#D1FAE5",
                      color: v.estimatedPackages === 0 ? "#DC2626" : "#065F46",
                    }}
                  >
                    ~{v.estimatedPackages} pakketten
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock warnings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-700">Bijna uitverkocht</h2>
            <Link href="/admin/voorraad" className="text-xs font-semibold" style={{ color: "#9B91BE" }}>
              Alle voorraad →
            </Link>
          </div>
          {lowStockFiltered.length === 0 ? (
            <p className="text-sm text-gray-400">Geen lage voorraad-meldingen 🎉</p>
          ) : (
            <div className="space-y-2">
              {lowStockFiltered.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[200px]">{p.name}</span>
                  <span
                    className="font-bold px-2 py-0.5 rounded-full text-xs"
                    style={{ background: "#FEF3C7", color: "#92400E" }}
                  >
                    {p.quantity} stuks
                  </span>
                </div>
              ))}
              {outOfStock > 0 && (
                <p className="text-xs text-red-500 mt-2">+ {outOfStock} product(en) volledig uitverkocht</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-700">Recente bestellingen</h2>
          <Link href="/admin/bestellingen" className="text-xs font-semibold" style={{ color: "#9B91BE" }}>
            Alle bestellingen →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400">Nog geen bestellingen</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b">
                <th className="pb-2 font-semibold">Klant</th>
                <th className="pb-2 font-semibold">Categorie</th>
                <th className="pb-2 font-semibold">Winst</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-semibold text-gray-700">{(o as any).customer?.name ?? "–"}</td>
                  <td className="py-2 text-gray-500">{CATEGORY_LABELS[o.category as Category]}</td>
                  <td className="py-2 font-bold text-green-600">{formatEuro(o.profit)}</td>
                  <td className="py-2">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2 text-gray-400">{new Date(o.createdAt!).toLocaleDateString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "Open", bg: "#FEF3C7", color: "#92400E" },
    packed: { label: "Ingepakt", bg: "#DBEAFE", color: "#1E40AF" },
    shipped: { label: "Verstuurd", bg: "#D1FAE5", color: "#065F46" },
    delivered: { label: "Bezorgd", bg: "#D1FAE5", color: "#065F46" },
    cancelled: { label: "Geannuleerd", bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
