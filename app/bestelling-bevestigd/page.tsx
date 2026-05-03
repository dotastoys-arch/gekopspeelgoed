import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function BestellingBevestigd({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId: orderIdStr } = await searchParams;
  const orderId = orderIdStr ? parseInt(orderIdStr) : null;

  let order = null;
  if (orderId) {
    order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { customer: true },
    });
  }

  const isPaid = order?.status !== "pending_payment" && order?.status !== "cancelled";
  const isCancelled = order?.status === "cancelled";
  const category = order?.category as Category | undefined;

  if (isCancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0EDF9" }}>
        <div className="bg-white rounded-3xl shadow-lg p-12 max-w-lg w-full text-center">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-3xl font-black mb-3 text-gray-700">Betaling niet gelukt</h1>
          <p className="text-gray-500 mb-8">
            Je betaling is niet voltooid. Je kunt het opnieuw proberen.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-2xl font-black text-white"
            style={{ background: "#9B91BE" }}
          >
            Opnieuw proberen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0EDF9" }}>
      <div className="bg-white rounded-3xl shadow-lg p-12 max-w-lg w-full text-center">

        {isPaid ? (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-black mb-3" style={{ color: "#9B91BE" }}>Betaling gelukt!</h1>
            <p className="text-gray-600 mb-1">
              Je <strong>{category ? CATEGORY_LABELS[category] : "pakket"}</strong>{" "}
              {category ? CATEGORY_EMOJI[category] : "🎁"} is bevestigd.
            </p>
            <p className="text-sm text-gray-400 mb-8">Bestelnummer: #{orderId}</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-black mb-3" style={{ color: "#9B91BE" }}>Betaling in behandeling</h1>
            <p className="text-gray-600 mb-1">Je betaling wordt verwerkt.</p>
            <p className="text-sm text-gray-400 mb-8">Bestelnummer: #{orderId}</p>
          </>
        )}

        <div className="bg-gray-50 rounded-2xl p-5 text-sm text-left text-gray-600 mb-8 space-y-2">
          <p>📧 Je bevestiging volgt per e-mail</p>
          <p>📦 Wij stellen jouw pakket samen met 5–6 leuke speeltjes</p>
          <p>🚀 Doorgaans verstuurd binnen 1–3 werkdagen</p>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-2xl font-black text-white"
          style={{ background: "#9B91BE" }}
        >
          Terug naar de shop
        </Link>
      </div>
    </div>
  );
}
