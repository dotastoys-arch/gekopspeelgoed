// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

export interface ParsedProduct {
  articleNumber: string;
  ean: string;
  name: string;
  quantity: number;
  unitPriceExcl: number;
  totalExcl: number;
}

export interface ParsedInvoice {
  supplier: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalExcl: number;
  totalBtw: number;
  totalIncl: number;
  products: ParsedProduct[];
}

export async function parseInvoicePdf(buffer: Buffer): Promise<ParsedInvoice> {
  const data = await pdfParse(buffer);
  const text = data.text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const invoice: ParsedInvoice = {
    supplier: extractSupplier(lines),
    invoiceNumber: extractValue(lines, /Factuur nummer\s+(\d+)/),
    invoiceDate: extractValue(lines, /Factuurdatum\s+([\d-]+)/),
    totalExcl: extractAmount(lines, /SubTotaal\s*:\s*€\s*([\d.,]+)/),
    totalBtw: extractAmount(lines, /BTW bedrag 21 %\s*:\s*€\s*([\d.,]+)/),
    totalIncl: extractAmount(lines, /Totaal\s*:\s*€\s*([\d.,]+)/),
    products: parseProductLines(text),
  };

  return invoice;
}

function extractSupplier(lines: string[]): string {
  for (const line of lines) {
    if (line.includes("Dino Trading") || line.includes("dinotoys")) return "Dino Trading bv";
    if (line.includes("bv") || line.includes("BV")) {
      const match = line.match(/^([A-Z][a-zA-Z\s]+(?:bv|BV|B\.V\.))/);
      if (match) return match[1].trim();
    }
  }
  return "Onbekende leverancier";
}

function extractValue(lines: string[], pattern: RegExp): string {
  const fullText = lines.join(" ");
  const match = fullText.match(pattern);
  return match ? match[1].trim() : "";
}

function extractAmount(lines: string[], pattern: RegExp): number {
  const fullText = lines.join(" ");
  const match = fullText.match(pattern);
  if (!match) return 0;
  return parseEuroAmount(match[1]);
}

function parseEuroAmount(str: string): number {
  // Handle Dutch number format: 1.518,62 → 1518.62
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

function parseProductLines(text: string): ParsedProduct[] {
  const products: ParsedProduct[] = [];

  // The Dino Trading PDF has a consistent table structure.
  // Each product line pattern (across multiple text lines per product):
  // ArticleNr  EAN  Description  OutIn  Quantity  Price  Total
  // We rebuild by scanning the raw text for EAN-like patterns (13 digits)

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Find the table header index
  let tableStart = lines.findIndex((l) =>
    l.includes("Artikelnummer") && l.includes("EAN Code") && l.includes("Omschrijving")
  );

  if (tableStart === -1) tableStart = 0;

  // Collect all tokens from product area (before footer amounts)
  const footerKeywords = ["Transport kosten", "BTW bedrag", "SubTotaal", "Totaal :", "Our terms"];

  const productLines: string[] = [];
  let inTable = false;
  for (const line of lines) {
    if (line.includes("Artikelnummer") && line.includes("EAN Code")) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (footerKeywords.some((k) => line.includes(k))) break;
    // Skip page header repeats
    if (line.includes("Factuur nummer") || line.includes("Factuurdatum") ||
        line.includes("Dino Trading") || line.includes("Betalingsconditie") ||
        line.includes("Klant BTW") || line.includes("Ordernummer") ||
        line.includes("Uw referentie") || line.includes("DINOTOYS") ||
        line.includes("DINOTRADE") || line.includes("Phone:") ||
        line.includes("Email:") || line.includes("Website:") ||
        line.includes("Bank :") || line.includes("BIC :") ||
        line.includes("IBAN :") || line.includes("VAT No") ||
        line.includes("C of C") || line.includes("Rabobank") ||
        line.startsWith("Dotastoys") || line.startsWith("Pijlspitskreek") ||
        line.startsWith("2241MT") || line.startsWith("Nederland") ||
        line.startsWith("Wassenaar") || line.startsWith("7332") ||
        line.startsWith("Apeldoorn") || line.startsWith("Lange")) {
      continue;
    }
    productLines.push(line);
  }

  // Now parse product blocks. Each product in the Dino format has:
  // Line 1: ArticleNr  EAN  NamePart1  OutIn  Qty  Price  Total
  // Line 2: NamePart2 (continuation, optional)
  // We detect a new product by: line starts with an article number pattern
  // OR contains a 13-digit EAN.

  const eanPattern = /^\d{8,14}$/;
  const euroPattern = /^€\s*[\d.,]+$/;
  const amountPattern = /^[\d.,]+$/;
  const outInPattern = /^\d+\/\d+$/;

  // Rebuild structured product rows by tokenizing
  // The PDF text comes out roughly line by line. Let's use a state machine approach.

  let i = 0;
  while (i < productLines.length) {
    const line = productLines[i];

    // Try to detect a line that contains product data
    // Key identifier: line contains a number that looks like an EAN or article number
    // and has a price-like token

    // Try to parse as a complete product line
    const parsed = tryParseProductLine(productLines, i);
    if (parsed) {
      products.push(parsed.product);
      i += parsed.consumed;
    } else {
      i++;
    }
  }

  return deduplicateByEan(products);
}

interface ParseAttempt {
  product: ParsedProduct;
  consumed: number;
}

function tryParseProductLine(lines: string[], startIdx: number): ParseAttempt | null {
  // Look at up to 3 lines at a time
  const window = lines.slice(startIdx, startIdx + 4).join(" ");

  // Must contain a total (€ X,XX) and a quantity (whole number)
  const eanMatch = window.match(/\b(\d{8,14})\b/);
  const priceMatch = window.match(/[€\s]([\d]+[,.][\d]{2})\s*€\s*([\d.]+[,.][\d]{2})/);
  const qtyMatch = window.match(/\b(\d+)\/\d+\b.*?\b(\d+)\b\s+[\d.,]+\s+€/);

  if (!eanMatch || !priceMatch) return null;

  // Extract article number (comes before or after EAN)
  const articleMatch = lines[startIdx].match(/^([A-Z0-9][-A-Z0-9]+)\s/);
  const articleNumber = articleMatch ? articleMatch[1] : "";
  const ean = eanMatch[1];

  // Extract name — everything that isn't a number/price/EAN token
  const nameParts: string[] = [];
  let qty = 0;
  let unitPrice = 0;
  let total = 0;

  // Collect name from description tokens
  const tokens = window.split(/\s+/);
  let nameTokens: string[] = [];
  let foundEan = false;
  let numberBuffer: string[] = [];

  for (const token of tokens) {
    if (token === ean) { foundEan = true; continue; }
    if (!foundEan) continue; // skip article num area

    if (/^€$/.test(token)) continue;
    if (/^\d+\/\d+$/.test(token)) continue; // out/in ratio

    if (/^\d{1,4}$/.test(token) && nameTokens.length > 0) {
      numberBuffer.push(token);
    } else if (/^[\d]+[,.][\d]{2}$/.test(token)) {
      numberBuffer.push(token);
    } else if (numberBuffer.length === 0) {
      nameTokens.push(token);
    }
  }

  // Parse numbers: qty, unitPrice, total
  const numericTokens = numberBuffer.filter(t => /^[\d.,]+$/.test(t));
  if (numericTokens.length >= 2) {
    // Last two are price and total; the one before (if exists and small) is qty
    const last = parseEuroAmount(numericTokens[numericTokens.length - 1]);
    const secondLast = parseEuroAmount(numericTokens[numericTokens.length - 2]);
    total = last;
    unitPrice = secondLast;

    // Find qty: a whole number preceding the prices
    for (let j = numericTokens.length - 3; j >= 0; j--) {
      const n = parseEuroAmount(numericTokens[j]);
      if (Number.isInteger(n) && n > 0 && n < 1000) {
        qty = n;
        break;
      }
    }
    if (qty === 0 && total > 0 && unitPrice > 0) {
      qty = Math.round(total / unitPrice);
    }
  }

  const name = nameTokens.join(" ").replace(/\s{2,}/g, " ").trim();

  if (!name || unitPrice <= 0 || qty <= 0) return null;

  // Count consumed lines (estimate based on name length)
  const consumed = name.length > 40 ? 2 : 1;

  return {
    product: { articleNumber, ean, name, quantity: qty, unitPriceExcl: unitPrice, totalExcl: total },
    consumed,
  };
}

function deduplicateByEan(products: ParsedProduct[]): ParsedProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.ean || `${p.articleNumber}-${p.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
