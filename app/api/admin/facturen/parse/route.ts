import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { suggestCategory } from "@/lib/pdf/suggest-category";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Duplicate detection: hash the PDF bytes
    const fileHash = createHash("sha256").update(buffer).digest("hex");

    // Check for exact same file (hash) or same invoice number
    // We also parse the invoice number from the text later, so we do a pre-check by hash first
    const hashDuplicate = await db.query.invoices.findFirst({
      where: eq(invoices.fileHash, fileHash),
    });
    if (hashDuplicate) {
      return NextResponse.json({
        duplicate: true,
        error: `Dit PDF-bestand is al eerder geüpload (factuur ${hashDuplicate.invoiceNumber ?? hashDuplicate.id} van ${hashDuplicate.invoiceDate ?? hashDuplicate.uploadedAt?.toLocaleDateString("nl-NL") ?? "onbekende datum"}).`,
      }, { status: 409 });
    }

    // Use lib directly to avoid pdf-parse v1 test-file-on-import bug
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    const text = data.text;
    const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);

    // Extract invoice metadata from full text
    const fullText = lines.join(" ");
    const invoiceNumberMatch = fullText.match(/Factuur nummer\s+(\d+)/);
    const invoiceDateMatch = fullText.match(/Factuurdatum\s+([\d\-]+)/);
    const totalExclMatch = fullText.match(/SubTotaal\s*:\s*€\s*([\d.,]+)/);
    const totalBtwMatch = fullText.match(/BTW bedrag 21\s*%\s*:\s*€\s*([\d.,]+)/);
    const totalInclMatch = fullText.match(/Totaal\s*:\s*€\s*([\d.,]+)/);

    const parseAmount = (s: string) => parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;

    const meta = {
      supplier: fullText.includes("Dino Trading") ? "Dino Trading bv" : "Onbekende leverancier",
      invoiceNumber: invoiceNumberMatch?.[1] ?? "",
      invoiceDate: invoiceDateMatch?.[1] ?? "",
      totalExcl: totalExclMatch ? parseAmount(totalExclMatch[1]) : 0,
      totalBtw: totalBtwMatch ? parseAmount(totalBtwMatch[1]) : 0,
      totalIncl: totalInclMatch ? parseAmount(totalInclMatch[1]) : 0,
      fileHash,
    };

    // Also check invoice number duplicate (same invoice, different filename)
    if (meta.invoiceNumber) {
      const numberDuplicate = await db.query.invoices.findFirst({
        where: eq(invoices.invoiceNumber, meta.invoiceNumber),
      });
      if (numberDuplicate) {
        return NextResponse.json({
          duplicate: true,
          error: `Factuur ${meta.invoiceNumber} is al eerder geüpload (op ${numberDuplicate.uploadedAt?.toLocaleDateString("nl-NL") ?? "onbekende datum"}).`,
        }, { status: 409 });
      }
    }

    const products = parseProducts(lines);

    // Add AI-based category suggestions
    const productsWithSuggestions = products.map((p) => {
      const sug = suggestCategory(p.name);
      return { ...p, suggestion: sug, gender: sug.gender, ageMin: sug.ageMin, ageMax: sug.ageMax };
    });

    return NextResponse.json({ meta, products: productsWithSuggestions });
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "PDF kon niet worden gelezen: " + String(err) }, { status: 500 });
  }
}

interface RawProduct {
  articleNumber: string;
  ean: string;
  name: string;
  quantity: number;
  unitPriceExcl: number;
  totalExcl: number;
}

/**
 * Dino Trading invoice PDF format (after pdf-parse text extraction):
 *
 * The PDF has multiple pages. Each page ends with address/footer info and
 * "Our terms of payment..." which repeats on every page.
 *
 * Each product:
 *   Line 1: "/EAN name-part-1"  OR  "/EAN name€ X,XX articleNr concatenatedNumbers" (embedded)
 *   Line 2: "name-part-2" (optional continuation)
 *   Data line: "€ X,XX ArticleNr concatenatedNumbers"
 *
 * Data line format: total€ + articleNr + qty + price(X,XX) + out + in all concatenated
 * Example: "€ 19,60Z50094-C82,45881" → total=19.60, article=Z50094-C, qty=8, price=2.45
 *
 * Strategy: try all possible X,XX substrings (not just greedy); pick the one where
 * total / price ≈ integer (that's the unit price, qty = round(total/price)).
 */
function parseProducts(lines: string[]): RawProduct[] {
  const products: RawProduct[] = [];
  const seenEans = new Set<string>();

  // Find table start: first header line
  const headerIdx = lines.findIndex(
    (l) => l.startsWith("Artikelnummer") && l.includes("EAN Code")
  );

  let i = headerIdx >= 0 ? headerIdx + 1 : 0;

  let currentEan = "";
  let currentNameParts: string[] = [];

  // "Our terms" is intentionally excluded — it appears on every page footer, not just the last.
  // We break only on the real invoice totals which appear once at the very end.
  const FOOTER_KEYWORDS = ["Transport kosten", "BTW bedrag", "SubTotaal", "Totaal :"];

  const ADDRESS_PATTERNS = [
    /^Dino Trading/, /^Lange Amerik/, /^7332/, /^Phone:/, /^Email:/, /^Website:/,
    /^Bank/, /^BIC/, /^IBAN/, /^VAT No/, /^C of C/, /^Rabobank/,
    /^Dotastoys/, /^Pijlspitskreek/, /^2241MT/, /^Nederland$/, /^Wassenaar/,
    /^Factuur nummer/, /^Factuurdatum/, /^Betalingsconditie/, /^Klant BTW/,
    /^Ordernummer/, /^Uw referentie/, /^DINOTOYS/, /^DINOTRADE/,
    /^Artikelnummer/, /^Our terms/,
    // Invoice number line that starts with digits (e.g. "6077298Factuur nummer...")
    /^\d{5,10}Factuur/,
  ];

  function isAddressLine(line: string): boolean {
    return ADDRESS_PATTERNS.some((p) => p.test(line));
  }

  function isDataLine(line: string): boolean {
    return line.startsWith("€ ") && /€\s*[\d,]+/.test(line);
  }

  function isProductStartLine(line: string): boolean {
    return /^\/\d{8,14}/.test(line);
  }

  function flushProduct(dataLine: string) {
    if (!currentEan || currentNameParts.length === 0) return;

    const ean = currentEan;
    const name = currentNameParts.join(" ").trim();

    if (!name || seenEans.has(ean)) return;

    const parsed = parseDataLine(dataLine);
    if (!parsed) return;

    seenEans.add(ean);
    products.push({
      articleNumber: parsed.articleNumber,
      ean,
      name,
      quantity: parsed.quantity,
      unitPriceExcl: parsed.price,
      totalExcl: parsed.total,
    });
  }

  while (i < lines.length) {
    const line = lines[i];
    i++;

    if (FOOTER_KEYWORDS.some((k) => line.includes(k))) break;
    if (isAddressLine(line)) continue;

    if (isProductStartLine(line)) {
      const eanMatch = line.match(/^\/(\d{8,14})(.*)/);
      if (!eanMatch) continue;

      currentEan = eanMatch[1];
      const rest = eanMatch[2].trim();

      // Detect embedded data: product name and data line on the same line
      // e.g. "/EAN5010994106966Nerf Elite 2.0 ACE SD-1 14x14cm€ 19,50F5035101,9561"
      const euroIdx = rest.indexOf("€");
      if (euroIdx >= 0) {
        const namePart = rest.slice(0, euroIdx).trim();
        const dataStr = rest.slice(euroIdx);
        currentNameParts = namePart ? [namePart] : [rest];
        flushProduct(dataStr);
        currentEan = "";
        currentNameParts = [];
      } else {
        currentNameParts = rest ? [rest] : [];
      }
      continue;
    }

    if (isDataLine(line)) {
      flushProduct(line);
      currentEan = "";
      currentNameParts = [];
      continue;
    }

    // Name continuation line
    if (currentEan && line.length > 0 && !isAddressLine(line)) {
      currentNameParts.push(line);
    }
  }

  return products;
}

function parseDataLine(line: string): { articleNumber: string; quantity: number; price: number; total: number } | null {
  // Format: "€ X,XX articleNr [qty][price,XX][out][in]" — all numbers concatenated
  const totalMatch = line.match(/^€\s*([\d]+,\d{2})/);
  if (!totalMatch) return null;

  const total = parseDutchAmount(totalMatch[1]);
  const afterTotal = line.slice(totalMatch[0].length).trim();

  // Article number: first word-like token after total
  const articleMatch = afterTotal.match(/^([A-Z0-9][A-Z0-9\-_]{1,15})/i);
  const articleNumber = articleMatch?.[1] ?? "";

  // Find ALL possible X,XX price candidates by trying 1–4 digits before each comma.
  // The greedy regex approach fails here because "82,45881" → greedy gives 82.45
  // but we need 2.45 (qty=8, 8×2.45=19.60). Trying just the last digit gives "2,45"=2.45 ✓
  const priceCandidates: number[] = [];
  for (let ci = 1; ci < afterTotal.length - 2; ci++) {
    if (afterTotal[ci] === ",") {
      const d1 = afterTotal[ci + 1], d2 = afterTotal[ci + 2];
      if (/\d/.test(d1) && /\d/.test(d2)) {
        for (let k = 1; k <= 4 && ci - k >= 0; k++) {
          const before = afterTotal.slice(ci - k, ci);
          if (!/^\d+$/.test(before)) break;
          const val = parseFloat(before + "." + d1 + d2);
          if (val > 0) priceCandidates.push(val);
        }
      }
    }
  }

  if (priceCandidates.length === 0) return null;

  const unique = [...new Set(priceCandidates)];
  let bestPrice = unique[0];
  let bestQty = 1;
  let bestError = Infinity;

  for (const price of unique) {
    if (price <= 0) continue;
    const approxQty = total / price;
    const roundedQty = Math.round(approxQty);
    const error = Math.abs(approxQty - roundedQty);
    if (roundedQty > 0 && roundedQty <= 500 && error < bestError) {
      bestError = error;
      bestPrice = price;
      bestQty = roundedQty;
    }
  }

  if (bestError > 0.05 || bestQty <= 0) return null;

  return { articleNumber, quantity: bestQty, price: bestPrice, total };
}

function parseDutchAmount(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}
