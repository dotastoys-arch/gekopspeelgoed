"use client";
import { useEffect, useState } from "react";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

interface Config {
  id: number;
  category: Category;
  sellingPriceIncl: number;
  itemsCount: number;
  minMarginPct: number;
  minProfit: number;
  shippingCost: number;
  vatRate: number;
}

function calcMargin(cfg: Config) {
  const excl = cfg.sellingPriceIncl / (1 + cfg.vatRate / 100);
  const contribution = excl - cfg.shippingCost;
  const maxBudget25pct = contribution * (1 - cfg.minMarginPct / 100);
  const maxBudgetMinProfit = contribution - cfg.minProfit;
  const maxBudget = Math.min(maxBudget25pct, maxBudgetMinProfit);
  const avgPerItem = maxBudget / cfg.itemsCount;
  return { excl, contribution, maxBudget, avgPerItem };
}

function euroFmt(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function InstellingenPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/instellingen")
      .then((r) => r.json())
      .then((d) => { setConfigs(d.configs ?? []); setLoading(false); });
  }, []);

  function update(category: Category, field: keyof Config, value: number) {
    setConfigs((prev) => prev.map((c) => c.category === category ? { ...c, [field]: value } : c));
  }

  async function save(cfg: Config) {
    setSaving(cfg.category);
    await fetch("/api/admin/instellingen", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSaving(null);
    setSaved(cfg.category);
    setTimeout(() => setSaved(null), 2000);
  }

  if (loading) return <div className="p-8 text-gray-400">Laden…</div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-black mb-1" style={{ color: "#9B91BE" }}>Instellingen</h1>
      <p className="text-gray-400 text-sm mb-8">Pas verkoopprijzen, marges en winstgrenzen aan per categorie</p>

      <div className="space-y-4">
        {configs.map((cfg) => {
          const { excl, contribution, maxBudget, avgPerItem } = calcMargin(cfg);
          return (
            <div key={cfg.category} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{CATEGORY_EMOJI[cfg.category]}</span>
                <div>
                  <div className="font-black text-gray-700">{CATEGORY_LABELS[cfg.category]}</div>
                  <div className="text-xs text-gray-400">Pakketinstellingen</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <Field label="Verkoopprijs (incl. BTW 21%)" prefix="€">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cfg.sellingPriceIncl}
                    onChange={(e) => update(cfg.category, "sellingPriceIncl", parseFloat(e.target.value))}
                    className="w-full border-b-2 border-gray-200 focus:border-[#9B91BE] outline-none px-1 py-1 text-lg font-bold transition-colors"
                  />
                </Field>
                <Field label="Aantal items per pakket">
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={cfg.itemsCount}
                    onChange={(e) => update(cfg.category, "itemsCount", parseInt(e.target.value))}
                    className="w-full border-b-2 border-gray-200 focus:border-[#9B91BE] outline-none px-1 py-1 text-lg font-bold transition-colors"
                  />
                </Field>
                <Field label="Verzendkosten" prefix="€">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cfg.shippingCost}
                    onChange={(e) => update(cfg.category, "shippingCost", parseFloat(e.target.value))}
                    className="w-full border-b-2 border-gray-200 focus:border-[#9B91BE] outline-none px-1 py-1 text-lg font-bold transition-colors"
                  />
                </Field>
                <Field label="Minimale marge %" suffix="%">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={cfg.minMarginPct}
                    onChange={(e) => update(cfg.category, "minMarginPct", parseFloat(e.target.value))}
                    className="w-full border-b-2 border-gray-200 focus:border-[#9B91BE] outline-none px-1 py-1 text-lg font-bold transition-colors"
                  />
                </Field>
                <Field label="Minimale winst" prefix="€">
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={cfg.minProfit}
                    onChange={(e) => update(cfg.category, "minProfit", parseFloat(e.target.value))}
                    className="w-full border-b-2 border-gray-200 focus:border-[#9B91BE] outline-none px-1 py-1 text-lg font-bold transition-colors"
                  />
                </Field>
              </div>

              {/* Live margin preview */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 grid grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Excl. BTW</div>
                  <div className="font-bold text-gray-600">{euroFmt(excl)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Na verzending</div>
                  <div className="font-bold text-gray-600">{euroFmt(contribution)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Max. inkoopbudget</div>
                  <div className="font-bold" style={{ color: maxBudget > 0 ? "#065F46" : "#DC2626" }}>
                    {euroFmt(maxBudget)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Max. per item gem.</div>
                  <div className="font-bold text-gray-600">{euroFmt(avgPerItem)}</div>
                </div>
              </div>

              <button
                onClick={() => save(cfg)}
                disabled={saving === cfg.category}
                className="px-6 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-60 transition-all"
                style={{ background: saved === cfg.category ? "#10B981" : "#9B91BE" }}
              >
                {saving === cfg.category ? "Opslaan…" : saved === cfg.category ? "✓ Opgeslagen!" : "Opslaan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Admin wachtwoord */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="font-black text-gray-700 mb-2">Admin wachtwoord</h2>
        <p className="text-sm text-gray-400">
          Het wachtwoord staat in het bestand <code className="bg-gray-100 px-1 rounded">.env.local</code> in de map van de website.
          Pas de regel <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD=admin123</code> aan.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, prefix, suffix }: { label: string; children: React.ReactNode; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-gray-400 text-sm">{prefix}</span>}
        {children}
        {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
