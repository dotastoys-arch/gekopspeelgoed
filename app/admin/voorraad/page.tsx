"use client";
import { useEffect, useState } from "react";

type Gender = "boy" | "girl" | "unisex";

interface ProductRow {
  id: number;
  name: string;
  ean: string | null;
  purchasePriceExcl: number;
  gender: Gender;
  ageMin: number;
  ageMax: number;
  isActive: boolean;
  isGift: boolean;
  quantity: number;
  inventoryId: number;
}

const AGE_OPTIONS = [
  { label: "0–3 jaar", min: 0, max: 3 },
  { label: "3–5 jaar", min: 3, max: 5 },
  { label: "6–8 jaar", min: 6, max: 8 },
  { label: "3–8 jaar", min: 3, max: 8 },
  { label: "0–8 jaar", min: 0, max: 8 },
];

function euroFmt(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function VoorraadPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"regulier" | "cadeaus">("regulier");
  const [filter, setFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/voorraad")
      .then((r) => r.json())
      .then((d) => { setRows(d.products ?? []); setLoading(false); });
  }, []);

  async function save(row: ProductRow) {
    setSaving(row.id);
    await fetch("/api/admin/voorraad", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: row.id,
        quantity: row.quantity,
        gender: row.gender,
        ageMin: row.ageMin,
        ageMax: row.ageMax,
        isActive: row.isActive,
        isGift: row.isGift,
      }),
    });
    setSaving(null);
  }

  async function toggleGift(row: ProductRow) {
    const updated = { ...row, isGift: !row.isGift };
    setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
    await fetch("/api/admin/voorraad", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: row.id, isGift: updated.isGift }),
    });
  }

  function update(id: number, field: keyof ProductRow, value: unknown) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  const regulierRows = rows.filter((r) => !r.isGift);
  const cadeauRows = rows.filter((r) => r.isGift);

  const activeRows = tab === "cadeaus" ? cadeauRows : regulierRows;
  const filtered = activeRows.filter((r) => {
    const textMatch = r.name.toLowerCase().includes(filter.toLowerCase()) || (r.ean ?? "").includes(filter);
    const genderMatch = genderFilter === "all" || r.gender === genderFilter;
    return textMatch && genderMatch;
  });

  const lowStock = regulierRows.filter((r) => r.quantity > 0 && r.quantity < 5).length;
  const outOfStock = regulierRows.filter((r) => r.quantity === 0 && r.isActive).length;

  if (loading) return <div className="p-6 text-gray-400">Laden…</div>;

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-black mb-1" style={{ color: "#9B91BE" }}>Voorraad</h1>
      <p className="text-gray-400 text-sm mb-6">Beheer producten en voorraadhoeveelheden</p>

      {/* Alerts */}
      {tab === "regulier" && (lowStock > 0 || outOfStock > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {lowStock > 0 && (
            <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#FEF3C7", color: "#92400E" }}>
              ⚠️ {lowStock} product{lowStock > 1 ? "en" : ""} bijna uitverkocht (&lt;5 stuks)
            </div>
          )}
          {outOfStock > 0 && (
            <div className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
              🔴 {outOfStock} product{outOfStock > 1 ? "en" : ""} uitverkocht
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setTab("regulier")}
          className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
          style={tab === "regulier"
            ? { background: "#9B91BE", color: "#fff" }
            : { background: "#F3F4F6", color: "#6B7280" }}
        >
          📦 Reguliere producten
          <span className="ml-2 text-xs opacity-70">({regulierRows.length})</span>
        </button>
        <button
          onClick={() => setTab("cadeaus")}
          className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
          style={tab === "cadeaus"
            ? { background: "#F06060", color: "#fff" }
            : { background: "#F3F4F6", color: "#6B7280" }}
        >
          🎁 Gratis cadeaus
          <span className="ml-2 text-xs opacity-70">({cadeauRows.length})</span>
        </button>
      </div>

      {tab === "cadeaus" && (
        <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: "#FEF3C7", color: "#92400E" }}>
          <strong>Gratis cadeau:</strong> klanten mogen één product hieruit kiezen als verrassing bij hun pakket. Klik op 🎁 bij een regulier product om het hier toe te voegen, of op ✕ om het te verwijderen.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="text" placeholder="Zoek op naam of EAN…" value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:border-[#9B91BE]" />
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value as Gender | "all")}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9B91BE]">
          <option value="all">Alle geslachten</option>
          <option value="boy">👦 Jongen</option>
          <option value="girl">👧 Meisje</option>
          <option value="unisex">🧒 Uniseks</option>
        </select>
        <span className="text-sm text-gray-400 self-center sm:ml-auto">{filtered.length} producten</span>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
          {tab === "cadeaus" ? "Nog geen cadeauproducten — voeg ze toe via 'Reguliere producten'" : "Geen producten gevonden"}
        </div>
      )}

      {/* ── Mobile: card list ── */}
      <div className="sm:hidden space-y-3">
        {filtered.map((row) => (
          <div key={row.id} className={`bg-white rounded-2xl p-4 shadow-sm ${!row.isActive ? "opacity-50" : row.quantity === 0 ? "border border-red-200" : row.quantity < 5 ? "border border-yellow-200" : ""}`}>
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="min-w-0">
                <div className="font-bold text-gray-800 text-sm leading-tight">{row.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{row.ean ?? "–"} · {euroFmt(row.purchasePriceExcl)}</div>
              </div>
              <button onClick={() => toggleGift(row)} className="text-xl flex-shrink-0">
                {row.isGift ? "✕" : "🎁"}
              </button>
            </div>
            {tab === "regulier" && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select value={row.gender} onChange={(e) => update(row.id, "gender", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                  <option value="boy">👦 Jongen</option>
                  <option value="girl">👧 Meisje</option>
                  <option value="unisex">🧒 Uniseks</option>
                </select>
                <select value={`${row.ageMin}-${row.ageMax}`}
                  onChange={(e) => { const [min, max] = e.target.value.split("-").map(Number); update(row.id, "ageMin", min); update(row.id, "ageMax", max); }}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                  {AGE_OPTIONS.map((opt) => (
                    <option key={opt.label} value={`${opt.min}-${opt.max}`}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            {tab === "regulier" && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input type="number" min={0} value={row.quantity}
                    onChange={(e) => update(row.id, "quantity", parseInt(e.target.value) || 0)}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#9B91BE]" />
                  {row.quantity === 0 && <span className="text-xs text-red-500 font-bold">Uitverkocht</span>}
                  {row.quantity > 0 && row.quantity < 5 && <span className="text-xs text-yellow-600 font-bold">Laag</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => update(row.id, "isActive", !row.isActive)}
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={row.isActive ? { background: "#D1FAE5", color: "#065F46" } : { background: "#F3F4F6", color: "#6B7280" }}>
                    {row.isActive ? "Actief" : "Inactief"}
                  </button>
                  <button onClick={() => save(row)} disabled={saving === row.id}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold text-white disabled:opacity-50"
                    style={{ background: "#9B91BE" }}>
                    {saving === row.id ? "…" : "Opslaan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Inkoop</th>
              {tab === "regulier" && <th className="px-4 py-3 font-semibold">Geslacht</th>}
              {tab === "regulier" && <th className="px-4 py-3 font-semibold">Leeftijd</th>}
              {tab === "regulier" && <th className="px-4 py-3 font-semibold">Voorraad</th>}
              {tab === "regulier" && <th className="px-4 py-3 font-semibold">Status</th>}
              <th className="px-4 py-3 font-semibold">{tab === "cadeaus" ? "Verwijderen" : "Cadeau"}</th>
              {tab === "regulier" && <th className="px-4 py-3 font-semibold"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((row) => (
              <tr key={row.id} className={!row.isActive ? "opacity-40" : row.quantity === 0 ? "bg-red-50/30" : row.quantity < 5 ? "bg-yellow-50/30" : ""}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-700 max-w-xs leading-tight">{row.name}</div>
                  <div className="text-xs text-gray-400">{row.ean ?? "–"}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-600">{euroFmt(row.purchasePriceExcl)}</td>
                {tab === "regulier" && (
                  <td className="px-4 py-3">
                    <select value={row.gender} onChange={(e) => update(row.id, "gender", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
                      <option value="boy">👦 Jongen</option>
                      <option value="girl">👧 Meisje</option>
                      <option value="unisex">🧒 Uniseks</option>
                    </select>
                  </td>
                )}
                {tab === "regulier" && (
                  <td className="px-4 py-3">
                    <select value={`${row.ageMin}-${row.ageMax}`}
                      onChange={(e) => { const [min, max] = e.target.value.split("-").map(Number); update(row.id, "ageMin", min); update(row.id, "ageMax", max); }}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
                      {AGE_OPTIONS.map((opt) => <option key={opt.label} value={`${opt.min}-${opt.max}`}>{opt.label}</option>)}
                    </select>
                  </td>
                )}
                {tab === "regulier" && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} value={row.quantity}
                        onChange={(e) => update(row.id, "quantity", parseInt(e.target.value) || 0)}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-[#9B91BE]" />
                      {row.quantity === 0 && <span className="text-xs text-red-500 font-bold">Uit</span>}
                      {row.quantity > 0 && row.quantity < 5 && <span className="text-xs text-yellow-600 font-bold">Laag</span>}
                    </div>
                  </td>
                )}
                {tab === "regulier" && (
                  <td className="px-4 py-3">
                    <button onClick={() => update(row.id, "isActive", !row.isActive)}
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={row.isActive ? { background: "#D1FAE5", color: "#065F46" } : { background: "#F3F4F6", color: "#6B7280" }}>
                      {row.isActive ? "Actief" : "Inactief"}
                    </button>
                  </td>
                )}
                <td className="px-4 py-3">
                  <button onClick={() => toggleGift(row)} className="text-lg hover:scale-110 transition-transform">
                    {row.isGift ? "✕" : "🎁"}
                  </button>
                </td>
                {tab === "regulier" && (
                  <td className="px-4 py-3">
                    <button onClick={() => save(row)} disabled={saving === row.id}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-white disabled:opacity-50"
                      style={{ background: "#9B91BE" }}>
                      {saving === row.id ? "…" : "Opslaan"}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
