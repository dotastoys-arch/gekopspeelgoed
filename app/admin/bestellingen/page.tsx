"use client";
import { useEffect, useState } from "react";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

interface OrderItem { product: { name: string }; quantity: number; purchasePriceExcl: number; }
interface Customer { name: string; email: string; address: string | null; postalCode: string | null; city: string | null; }
interface Order {
  id: number; category: Category; sellingPriceIncl: number; totalPurchaseExcl: number;
  profit: number; status: string; createdAt: string; notes: string | null;
  customer: Customer; orderItems: OrderItem[];
}

const STATUS_OPTIONS = ["pending", "packed", "shipped", "delivered", "cancelled"];
const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: "Open",        bg: "#FEF3C7", color: "#92400E" },
  packed:    { label: "Ingepakt",    bg: "#DBEAFE", color: "#1E40AF" },
  shipped:   { label: "Verstuurd",   bg: "#D1FAE5", color: "#065F46" },
  delivered: { label: "Bezorgd",     bg: "#D1FAE5", color: "#065F46" },
  cancelled: { label: "Geannuleerd", bg: "#FEE2E2", color: "#DC2626" },
};

function euroFmt(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function BestellingenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/bestellingen").then((r) => r.json())
      .then((d) => { setOrders(d.orders ?? []); setLoading(false); });
  }, []);

  async function updateStatus(orderId: number, status: string) {
    await fetch("/api/admin/bestellingen", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  const totalProfit = filtered.reduce((s, o) => s + o.profit, 0);

  if (loading) return <div className="p-6 text-gray-400">Laden…</div>;

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-black mb-1" style={{ color: "#9B91BE" }}>Bestellingen</h1>
      <p className="text-gray-400 text-sm mb-4">Beheer en verwerk klantbestellingen</p>

      {/* Summary — scrollable row on mobile */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
        {["pending", "packed", "shipped"].map((s) => {
          const cnt = orders.filter((o) => o.status === s).length;
          const st = STATUS_LABELS[s];
          return (
            <div key={s} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 flex-shrink-0">
              <span className="font-black text-xl" style={{ color: st.color }}>{cnt}</span>
              <span className="text-sm text-gray-500">{st.label}</span>
            </div>
          );
        })}
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-2 flex-shrink-0 ml-auto">
          <span className="font-black text-xl text-green-600">{euroFmt(totalProfit)}</span>
          <span className="text-sm text-gray-500">Winst</span>
        </div>
      </div>

      {/* Filter pills — wrapping */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={statusFilter === s
              ? { background: "#9B91BE", color: "white" }
              : { background: "white", color: "#6B7280", border: "1px solid #E5E7EB" }}>
            {s === "all" ? "Alle" : STATUS_LABELS[s].label}
            {s !== "all" && ` (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">Geen bestellingen gevonden</div>
      )}

      <div className="space-y-2">
        {filtered.map((order) => {
          const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : order.id)}>
                <span className="text-xl flex-shrink-0">{CATEGORY_EMOJI[order.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-700 truncate">{order.customer.name}</div>
                  <div className="text-xs text-gray-400">{CATEGORY_LABELS[order.category]} · {new Date(order.createdAt).toLocaleDateString("nl-NL")}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-green-600 text-sm">{euroFmt(order.profit)}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold hidden sm:inline"
                    style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  <span className="text-gray-300 text-sm">{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/30 space-y-4">
                  {/* Info — stacked on mobile, 3-col on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Klant</div>
                      <div className="font-semibold">{order.customer.name}</div>
                      <div className="text-gray-500 break-all">{order.customer.email}</div>
                      {order.customer.address && <div className="text-gray-400">{order.customer.address}</div>}
                      {order.customer.postalCode && <div className="text-gray-400">{order.customer.postalCode} {order.customer.city}</div>}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Financieel</div>
                      <div>Verkoop: <strong>{euroFmt(order.sellingPriceIncl)}</strong></div>
                      <div>Inkoop: <strong>{euroFmt(order.totalPurchaseExcl)}</strong></div>
                      <div className="text-green-600">Winst: <strong>{euroFmt(order.profit)}</strong></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Status</div>
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none w-full">
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Products */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Inhoud pakket</div>
                    <div className="space-y-1">
                      {order.orderItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm gap-2">
                          <span className="text-gray-600 truncate">· {item.product.name}</span>
                          <span className="text-gray-400 flex-shrink-0">{euroFmt(item.purchasePriceExcl)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
