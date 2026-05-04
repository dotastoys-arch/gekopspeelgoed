"use client";
import { useState, useCallback } from "react";

type Gender = "boy" | "girl" | "unisex";
type Confidence = "high" | "medium" | "low";

interface ProductRow {
  articleNumber: string;
  ean: string;
  name: string;
  quantity: number;
  unitPriceExcl: number;
  totalExcl: number;
  gender: Gender;
  ageMin: number;
  ageMax: number;
  suggestion: { confidence: Confidence };
}

interface InvoiceMeta {
  supplier: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalExcl: number;
  totalBtw: number;
  totalIncl: number;
}

const GENDER_LABELS: Record<Gender, string> = {
  boy: "👦 Jongen",
  girl: "👧 Meisje",
  unisex: "🧒 Uniseks",
};

const AGE_OPTIONS = [
  { label: "0–3 jaar (baby)", min: 0, max: 3 },
  { label: "3–5 jaar", min: 3, max: 5 },
  { label: "6–8 jaar", min: 6, max: 8 },
  { label: "3–8 jaar", min: 3, max: 8 },
  { label: "0–8 jaar", min: 0, max: 8 },
];

function euroFmt(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function FacturenPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<InvoiceMeta | null>(null);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [savedResult, setSavedResult] = useState<{ created: number; updated: number } | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setSavedResult(null);
    setFileName(file.name);
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/admin/facturen/parse", { method: "POST", body: form });
    setUploading(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Fout bij verwerken");
      return;
    }

    const data = await res.json();
    setMeta(data.meta);
    setRows(data.products ?? []);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) handleFile(file);
    },
    [handleFile]
  );

  function updateRow(idx: number, field: keyof ProductRow, value: unknown) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  async function handleSave() {
    if (!meta || rows.length === 0) return;
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/facturen/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta: { ...meta, filename: fileName }, products: rows }),
    });

    setSaving(false);
    if (res.ok) {
      const result = await res.json();
      setSavedResult({ created: result.created, updated: result.updated });
      setRows([]);
      setMeta(null);
    } else {
      const err = await res.json();
      setError(err.error ?? "Fout bij opslaan");
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <h1 className="text-2xl font-black mb-1" style={{ color: "#9B91BE" }}>Facturen</h1>
      <p className="text-gray-400 text-sm mb-8">Upload een inkoopfactuur (PDF of afbeelding) om producten en voorraad bij te werken</p>

      {/* Upload area */}
      {rows.length === 0 && !savedResult && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer"
          style={{ borderColor: dragging ? "#9B91BE" : "#D1C8EC", background: dragging ? "#F0EDF9" : "white" }}
          onClick={() => document.getElementById("pdf-input")?.click()}
        >
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {uploading ? (
            <div>
              <div className="text-4xl mb-3 animate-pulse">🔍</div>
              <p className="text-gray-500 font-semibold">Factuur verwerken…</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📁</div>
              <p className="font-bold text-gray-600">Sleep factuur hierheen of klik om te kiezen</p>
              <p className="text-sm text-gray-400 mt-1">PDF of screenshot (PNG, JPG) — Gemini leest de afbeelding automatisch uit</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">{error}</div>
      )}

      {savedResult && (
        <div className="p-6 rounded-2xl bg-green-50 border border-green-200">
          <p className="font-black text-green-700 text-lg">✅ Factuur opgeslagen!</p>
          <p className="text-green-600 text-sm mt-1">
            {savedResult.created} nieuwe producten aangemaakt · {savedResult.updated} bestaande producten bijgewerkt
          </p>
          <button
            className="mt-4 px-5 py-2 rounded-xl text-white font-bold text-sm"
            style={{ background: "#9B91BE" }}
            onClick={() => setSavedResult(null)}
          >
            Nog een factuur uploaden
          </button>
        </div>
      )}

      {/* Parsed invoice review */}
      {meta && rows.length > 0 && (
        <div className="mt-6">
          {/* Invoice summary */}
          <div className="bg-white rounded-2xl p-5 mb-6 flex items-center gap-8 shadow-sm">
            <div>
              <div className="text-xs text-gray-400">Leverancier</div>
              <div className="font-bold text-gray-700">{meta.supplier}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Factuurnummer</div>
              <div className="font-bold text-gray-700">{meta.invoiceNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Datum</div>
              <div className="font-bold text-gray-700">{meta.invoiceDate}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Totaal incl. BTW</div>
              <div className="font-bold text-gray-700">{euroFmt(meta.totalIncl)}</div>
            </div>
            <div className="ml-auto">
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                {rows.length} producten herkend
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Controleer of leeftijd en geslacht kloppen. Items met een 🟡 zijn minder zeker — check die even.
          </p>

          {/* Product table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Productnaam</th>
                  <th className="px-4 py-3 font-semibold">Aantal</th>
                  <th className="px-4 py-3 font-semibold">Inkoop excl.</th>
                  <th className="px-4 py-3 font-semibold">Geslacht</th>
                  <th className="px-4 py-3 font-semibold">Leeftijd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, idx) => (
                  <tr key={idx} className={row.suggestion.confidence === "low" ? "bg-yellow-50/30" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-700 max-w-xs">
                        {row.suggestion.confidence === "low" && <span className="mr-1">🟡</span>}
                        {row.suggestion.confidence === "medium" && <span className="mr-1">🟢</span>}
                        {row.suggestion.confidence === "high" && <span className="mr-1">🟢</span>}
                        {row.name}
                      </div>
                      <div className="text-xs text-gray-400">{row.ean}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-600">{row.quantity}</td>
                    <td className="px-4 py-3 font-bold text-gray-600">{euroFmt(row.unitPriceExcl)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={row.gender}
                        onChange={(e) => updateRow(idx, "gender", e.target.value as Gender)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#9B91BE]"
                      >
                        <option value="boy">👦 Jongen</option>
                        <option value="girl">👧 Meisje</option>
                        <option value="unisex">🧒 Uniseks</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={`${row.ageMin}-${row.ageMax}`}
                        onChange={(e) => {
                          const [min, max] = e.target.value.split("-").map(Number);
                          updateRow(idx, "ageMin", min);
                          updateRow(idx, "ageMax", max);
                        }}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#9B91BE]"
                      >
                        {AGE_OPTIONS.map((opt) => (
                          <option key={opt.label} value={`${opt.min}-${opt.max}`}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ background: "#9B91BE" }}
            >
              {saving ? "Opslaan…" : `✅ Opslaan (${rows.length} producten)`}
            </button>
            <button
              onClick={() => { setRows([]); setMeta(null); setFileName(""); }}
              className="px-6 py-3 rounded-xl font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
