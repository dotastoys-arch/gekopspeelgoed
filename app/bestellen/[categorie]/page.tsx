"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_EMOJI, CATEGORY_COLOR, SLUG_TO_CATEGORY } from "@/lib/categories";
import type { Category } from "@/lib/db/schema";

interface GiftProduct {
  id: number;
  name: string;
  imageUrl: string | null;
}

interface FormState {
  name: string;
  email: string;
  street: string;
  huisnummer: string;
  postalCode: string;
  city: string;
}

export default function BestelPage({ params }: { params: Promise<{ categorie: string }> }) {
  return (
    <Suspense fallback={null}>
      <BestelPageInner params={params} />
    </Suspense>
  );
}

function BestelPageInner({ params }: { params: Promise<{ categorie: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // urlDiscountToken: only set when user comes from abandoned cart email → enables 10% discount
  const urlDiscountToken = searchParams.get("token");

  const [cat, setCat] = useState<Category | null>(null);
  const [step, setStep] = useState<"form" | "cadeau">("form");
  const [form, setForm] = useState<FormState>({ name: "", email: "", street: "", huisnummer: "", postalCode: "", city: "" });
  const [gifts, setGifts] = useState<GiftProduct[] | null>(null);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressStatus, setAddressStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [returningCustomer, setReturningCustomer] = useState(false);
  // cartToken: token of the saved abandoned cart (used to mark it completed on order, no discount)
  const [cartToken, setCartToken] = useState<string | null>(null);

  const addressLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    params.then((p) => {
      const category = SLUG_TO_CATEGORY[p.categorie] ?? null;
      setCat(category);
    });
    fetch("/api/cadeaus").then((r) => r.json()).then(setGifts).catch(() => setGifts([]));
  }, [params]);

  // Load abandoned cart data if token present (only when arriving from email link)
  useEffect(() => {
    if (!urlDiscountToken) return;
    fetch(`/api/abandoned-cart?token=${urlDiscountToken}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) {
          const [street, ...rest] = (data.address ?? "").split(" ");
          setForm({
            name: data.name ?? "",
            email: data.email ?? "",
            street: street ?? "",
            huisnummer: rest.join(" "),
            postalCode: data.postalCode ?? "",
            city: data.city ?? "",
          });
          setReturningCustomer(true);
        }
      })
      .catch(() => {});
  }, [urlDiscountToken]);

  const lookupAddress = useCallback((postalCode: string, huisnummer: string) => {
    const pc = postalCode.replace(/\s/g, "");
    if (pc.length < 6 || !huisnummer.trim()) return;
    if (addressLookupTimer.current) clearTimeout(addressLookupTimer.current);
    addressLookupTimer.current = setTimeout(async () => {
      setAddressStatus("loading");
      try {
        const res = await fetch(`/api/adres-lookup?postcode=${pc}&huisnummer=${encodeURIComponent(huisnummer.trim())}`);
        const data = await res.json();
        if (data.found) {
          setForm((f) => ({ ...f, street: data.straat, city: data.woonplaats }));
          setAddressStatus("found");
        } else {
          setAddressStatus("not_found");
        }
      } catch {
        setAddressStatus("not_found");
      }
    }, 500);
  }, []);

  function handlePostcodeChange(value: string) {
    setForm((f) => { const next = { ...f, postalCode: value }; lookupAddress(value, f.huisnummer); return next; });
    setAddressStatus("idle");
  }

  function handleHuisnummerChange(value: string) {
    setForm((f) => { const next = { ...f, huisnummer: value }; lookupAddress(f.postalCode, value); return next; });
    setAddressStatus("idle");
  }

  async function handleEmailBlur() {
    if (!form.email || returningCustomer) return;
    try {
      const res = await fetch(`/api/klant-gegevens?email=${encodeURIComponent(form.email)}`);
      const data = await res.json();
      if (data.found) {
        const [street, ...rest] = (data.address ?? "").split(" ");
        setForm((f) => ({
          ...f,
          name: data.name || f.name,
          street: street || f.street,
          huisnummer: rest.join(" ") || f.huisnummer,
          postalCode: data.postalCode || f.postalCode,
          city: data.city || f.city,
        }));
        setReturningCustomer(true);
      }
    } catch {}
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cat) return;
    // Save abandoned cart in background
    const address = `${form.street} ${form.huisnummer}`.trim();
    fetch("/api/abandoned-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, address, postalCode: form.postalCode, city: form.city, category: cat }),
    }).then((r) => r.json()).then((d) => {
      if (d.token) setCartToken(d.token);
    }).catch(() => {});
    setStep("cadeau");
  }

  async function submitOrder(giftProductId: number | null) {
    if (!cat) return;
    setLoading(true);
    setError("");
    const address = `${form.street} ${form.huisnummer}`.trim();

    const res = await fetch("/api/bestellingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: cat,
        name: form.name,
        email: form.email,
        address,
        postalCode: form.postalCode,
        city: form.city,
        giftProductId,
        // urlDiscountToken gives 10% off; cartToken just marks the cart completed
        discountToken: urlDiscountToken ?? cartToken ?? null,
      }),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      if (data.mollieUrl) {
        window.location.href = data.mollieUrl;
      } else {
        router.push(`/bestelling-bevestigd?orderId=${data.orderId}`);
      }
    } else {
      const err = await res.json();
      setError(err.error ?? "Er ging iets mis. Probeer het opnieuw.");
      setStep("form");
    }
  }

  if (!cat) return null;

  const label = CATEGORY_LABELS[cat];
  const emoji = CATEGORY_EMOJI[cat];
  const color = CATEGORY_COLOR[cat];
  const hasDiscount = !!urlDiscountToken;
  const displayPrice = hasDiscount ? "€31,46" : "€34,95";

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => step === "cadeau" ? setStep("form") : router.push("/")}
            className="text-sm font-semibold text-gray-400 hover:text-[#9B91BE]"
          >
            ← Terug
          </button>
          <div className="flex-1 text-center">
            <span className="text-lg font-black" style={{ color: "#9B91BE" }}>GEK OP ♥ SPEELGOED</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Discount banner */}
        {hasDiscount && (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: "#FEF2F2", border: "2px solid #F06060" }}>
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black text-sm" style={{ color: "#DC2626" }}>10% korting toegepast!</p>
              <p className="text-xs text-gray-500">Je betaalt <strong>{displayPrice}</strong> in plaats van €34,95</p>
            </div>
          </div>
        )}

        {/* Returning customer banner */}
        {returningCustomer && !hasDiscount && (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: "#F0FDF4", border: "2px solid #4DC97E" }}>
            <span className="text-2xl">👋</span>
            <p className="font-semibold text-sm text-green-700">Welkom terug! We hebben je gegevens ingevuld.</p>
          </div>
        )}

        {/* Package header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: color + "30" }}>
            {emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-800">{label}</h1>
            <p className="text-sm text-gray-500">5–6 verrassende speeltjes · uniek samengesteld · morgen verstuurd</p>
          </div>
          <div className="text-right">
            {hasDiscount && <div className="text-sm line-through text-gray-400">€34,95</div>}
            <div className="text-2xl font-black" style={{ color: hasDiscount ? "#F06060" : "#9B91BE" }}>{displayPrice}</div>
            <div className="text-xs text-gray-400">incl. BTW + verzending</div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: step === "form" ? "#9B91BE" : "#D1FAE5" }}>
              {step === "form" ? "1" : "✓"}
            </div>
            <span className={`text-sm font-semibold ${step === "form" ? "text-gray-700" : "text-green-600"}`}>Gegevens</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: step === "cadeau" ? "#F06060" : "#E5E7EB" }}>
              2
            </div>
            <span className={`text-sm font-semibold ${step === "cadeau" ? "text-gray-700" : "text-gray-400"}`}>Gratis cadeau</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white bg-gray-200">3</div>
            <span className="text-sm font-semibold text-gray-400">Betalen</span>
          </div>
        </div>

        {/* STEP 1: Form */}
        {step === "form" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="font-black text-gray-700 text-lg mb-6">Jouw gegevens</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Naam *">
                  <input type="text" placeholder="Voor- en achternaam" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
                </FormField>
                <FormField label="E-mailadres *">
                  <input type="email" placeholder="jouw@email.nl" required value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    onBlur={handleEmailBlur}
                    className="input-field" />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Postcode *">
                  <input type="text" placeholder="1234 AB" required value={form.postalCode}
                    onChange={(e) => handlePostcodeChange(e.target.value)} className="input-field" />
                </FormField>
                <FormField label="Huisnummer *">
                  <input type="text" placeholder="12A" required value={form.huisnummer}
                    onChange={(e) => handleHuisnummerChange(e.target.value)} className="input-field" />
                </FormField>
                <div className="flex items-end pb-1">
                  {addressStatus === "loading" && <span className="text-xs text-gray-400">Zoeken…</span>}
                  {addressStatus === "found" && <span className="text-xs font-semibold text-green-600">✓ Adres gevonden</span>}
                  {addressStatus === "not_found" && <span className="text-xs font-semibold text-red-500">Adres niet gevonden</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Straat *">
                  <input type="text" placeholder="Voorbeeldstraat" required value={form.street}
                    onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    className={`input-field ${addressStatus === "found" ? "bg-green-50" : ""}`} />
                </FormField>
                <FormField label="Stad *">
                  <input type="text" placeholder="Amsterdam" required value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className={`input-field ${addressStatus === "found" ? "bg-green-50" : ""}`} />
                </FormField>
              </div>

              {error && (
                <div className="p-4 rounded-xl text-sm font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 mt-4">
                <button type="submit" className="w-full py-4 rounded-2xl font-black text-white text-lg transition-opacity"
                  style={{ background: "#9B91BE" }}>
                  Volgende: kies je cadeau →
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  🚀 Vandaag besteld = morgen verstuurd · Betaal veilig via Mollie
                </p>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Gift selection */}
        {step === "cadeau" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🎁</div>
              <h2 className="font-black text-gray-700 text-xl mb-2">Kies jouw gratis cadeau!</h2>
              <p className="text-sm text-gray-400">Selecteer één extraatje dat we gratis toevoegen aan jouw pakket</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <button onClick={() => setSelectedGift(null)}
                className="rounded-2xl p-4 border-2 text-center transition-all"
                style={selectedGift === null ? { borderColor: "#9B91BE", background: "#9B91BE15" } : { borderColor: "#E5E7EB", background: "#fff" }}>
                <div className="text-3xl mb-2">🙈</div>
                <div className="text-xs font-bold text-gray-600">Geen cadeau</div>
                <div className="text-xs text-gray-400">Verrassing volledig</div>
              </button>

              {gifts === null && (
                <div className="col-span-2 flex items-center justify-center py-4 text-sm text-gray-400">Laden…</div>
              )}

              {(gifts ?? []).map((gift) => (
                <button key={gift.id} onClick={() => setSelectedGift(gift.id)}
                  className="rounded-2xl p-4 border-2 text-center transition-all"
                  style={selectedGift === gift.id ? { borderColor: "#F06060", background: "#F0606015" } : { borderColor: "#E5E7EB", background: "#fff" }}>
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="w-16 h-16 object-contain mx-auto mb-2 rounded-xl" />
                  ) : (
                    <div className="text-3xl mb-2">🧸</div>
                  )}
                  <div className="text-xs font-bold text-gray-700 leading-tight line-clamp-2">{gift.name}</div>
                  <div className="text-xs mt-1 font-bold" style={{ color: "#4DC97E" }}>GRATIS</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm font-semibold mb-4" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                ⚠️ {error}
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                <span>Pakket {label}</span>
                <span className="font-bold text-gray-700">
                  {hasDiscount ? <><s className="text-gray-400 font-normal mr-1">€34,95</s>{displayPrice}</> : "€34,95"}
                </span>
              </div>
              {selectedGift !== null && (
                <div className="flex items-center justify-between mb-4 text-sm" style={{ color: "#4DC97E" }}>
                  <span className="font-semibold">🎁 {(gifts ?? []).find(g => g.id === selectedGift)?.name}</span>
                  <span className="font-bold">GRATIS</span>
                </div>
              )}
              <button onClick={() => submitOrder(selectedGift)} disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-white text-lg disabled:opacity-60 transition-opacity"
                style={{ background: "#4DC97E" }}>
                {loading ? "Bestelling aanmaken…" : `🎁 Bestel nu — ${displayPrice}`}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                🚀 Vandaag besteld = morgen verstuurd · Betaal veilig via Mollie
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #9B91BE; }
        .input-field.bg-green-50 { background: #F0FDF4; }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}
