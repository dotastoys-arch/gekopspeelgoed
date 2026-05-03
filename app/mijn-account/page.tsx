import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LogoutButton from "./LogoutButton";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Wacht op betaling",
  pending: "In behandeling",
  packed: "Ingepakt",
  shipped: "Verstuurd",
  delivered: "Bezorgd",
  cancelled: "Geannuleerd",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending_payment: { bg: "#FEF3C7", text: "#92400E" },
  pending:         { bg: "#DBEAFE", text: "#1E40AF" },
  packed:          { bg: "#E0E7FF", text: "#3730A3" },
  shipped:         { bg: "#D1FAE5", text: "#065F46" },
  delivered:       { bg: "#D1FAE5", text: "#065F46" },
  cancelled:       { bg: "#FEE2E2", text: "#991B1B" },
};

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function MijnAccountPage() {
  const session = await getCustomerSession();
  if (!session.customerId) redirect("/mijn-account/inloggen");

  const customerOrders = await db.query.orders.findMany({
    where: eq(orders.customerId, session.customerId),
  });

  const sorted = customerOrders.sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF9" }}>
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "#2D2B3A" }}>
              Hallo, {session.customerName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">{session.customerEmail}</p>
          </div>
          <LogoutButton />
        </div>

        <h2 className="font-black text-gray-700 mb-4">Mijn bestellingen</h2>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-black text-gray-700 mb-2">Nog geen bestellingen</p>
            <p className="text-sm text-gray-500 mb-6">Je hebt nog geen pakket besteld. Ontdek ons aanbod!</p>
            <a href="/#pakketten"
              className="inline-block px-6 py-3 rounded-xl font-black text-white text-sm"
              style={{ background: "#4DC97E" }}>
              Bestel nu een pakket
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((order) => {
              const sc = STATUS_COLOR[order.status] ?? { bg: "#F3F4F6", text: "#374151" };
              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{CATEGORY_EMOJI[order.category as Category]}</span>
                        <span className="font-black text-gray-800">{CATEGORY_LABELS[order.category as Category]}</span>
                      </div>
                      <p className="text-xs text-gray-400">Bestelling #{order.id} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: sc.bg, color: sc.text }}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="font-black text-gray-700">
                        €{order.sellingPriceIncl.toFixed(2).replace(".", ",")}
                      </span>
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
