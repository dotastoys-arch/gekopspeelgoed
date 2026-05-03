"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type OrderResult = {
  id: number;
  category: string;
  categoryLabel: string;
  categoryEmoji: string;
  sellingPriceIncl: number;
  status: string;
  statusLabel: string;
  createdAt: string;
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending_payment: { bg: "#FEF3C7", text: "#92400E" },
  pending:         { bg: "#DBEAFE", text: "#1E40AF" },
  packed:          { bg: "#E0E7FF", text: "#3730A3" },
  shipped:         { bg: "#D1FAE5", text: "#065F46" },
  delivered:       { bg: "#D1FAE5", text: "#065F46" },
  cancelled:       { bg: "#FEE2E2", text: "#991B1B" },
};

export default function MijnAccountPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [customerName, setCustomerName] = useState("");
  const [orderList, setOrderList] = useState<OrderResult[]>([]);
  const [notFound, setNotFound] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setNotFound(false);

    const res = await fetch(`/api/mijn-account?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (!data.found || data.orders.length === 0) {
      setNotFound(true);
      setState("done");
      return;
    }

    setCustomerName(data.name);
    setOrderList(data.orders);
    setState("done");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1 w-full">
        <div className="text-5xl mb-6 text-center">👤</div>
        <h1 className="text-3xl sm:text-4xl font-black text-center mb-3" style={{ color: "#2D2B3A" }}>Mijn bestellingen</h1>
        <p className="text-center text-gray-500 mb-10 text-sm">Vul je e-mailadres in om je bestellingen te bekijken.</p>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm mb-6">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setState("idle"); setNotFound(false); }}
              placeholder="jouw@email.nl"
              className="flex-1 border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9B91BE] transition-colors"
              style={{ borderColor: "#E5E7EB" }}
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="px-6 py-3 rounded-xl font-black text-white text-sm transition-opacity disabled:opacity-60 whitespace-nowrap"
              style={{ background: "#9B91BE" }}
            >
              {state === "loading" ? "Zoeken..." : "Bestellingen ophalen"}
            </button>
          </form>
        </div>

        {state === "done" && notFound && (
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-black text-gray-700 mb-2">Geen bestellingen gevonden</p>
            <p className="text-sm text-gray-500 mb-6">We konden geen bestellingen vinden voor dit e-mailadres.</p>
            <Link href="/#pakketten"
              className="inline-block px-6 py-3 rounded-xl font-black text-white text-sm"
              style={{ background: "#4DC97E" }}>
              Bestel nu een pakket
            </Link>
          </div>
        )}

        {state === "done" && !notFound && orderList.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 px-1">
              Hallo <strong>{customerName}</strong> — {orderList.length} bestelling{orderList.length !== 1 ? "en" : ""} gevonden.
            </p>

            {orderList.map((order) => {
              const sc = STATUS_COLOR[order.status] ?? { bg: "#F3F4F6", text: "#374151" };
              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{order.categoryEmoji}</span>
                        <span className="font-black text-gray-800">{order.categoryLabel}</span>
                      </div>
                      <p className="text-xs text-gray-400">Bestelling #{order.id} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {order.statusLabel}
                      </span>
                      <span className="font-black text-gray-700">€{order.sellingPriceIncl.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
