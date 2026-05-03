import { db } from "@/lib/db";
import { products, inventory, packageConfigs, orders, orderItems, customers } from "@/lib/db/schema";
import { eq, and, gt, inArray, not, sql } from "drizzle-orm";
import type { Category } from "@/lib/db/schema";

export interface PackageProduct {
  productId: number;
  name: string;
  purchasePriceExcl: number;
  ean: string | null;
  imageUrl: string | null;
}

export interface GeneratedPackage {
  category: Category;
  items: PackageProduct[];
  totalPurchaseExcl: number;
  sellingPriceIncl: number;
  sellingPriceExcl: number;
  shippingCost: number;
  vatOnSale: number;
  contribution: number;
  profit: number;
  marginPct: number;
  viable: boolean;
  reason?: string;
}

export interface PackageViability {
  possiblePackages: number;
  insufficientStock: string[];
  insufficientMargin: boolean;
}

// Returns categories that match a product's age/gender
export function productMatchesCategory(
  product: { gender: string; ageMin: number; ageMax: number },
  category: Category
): boolean {
  const { gender, ageMin, ageMax } = product;

  switch (category) {
    case "baby_0_3":
      return ageMax <= 4 && (gender === "unisex" || gender === "boy" || gender === "girl");
    case "boys_3_5":
      return (gender === "boy" || gender === "unisex") && ageMin <= 5 && ageMax >= 3;
    case "boys_6_8":
      return (gender === "boy" || gender === "unisex") && ageMin <= 8 && ageMax >= 5;
    case "girls_3_5":
      return (gender === "girl" || gender === "unisex") && ageMin <= 5 && ageMax >= 3;
    case "girls_6_8":
      return (gender === "girl" || gender === "unisex") && ageMin <= 8 && ageMax >= 5;
  }
}

export async function generatePackage(
  category: Category,
  customerId: number
): Promise<GeneratedPackage> {
  // Get config for this category
  const config = await db.query.packageConfigs.findFirst({
    where: eq(packageConfigs.category, category),
  });

  if (!config) throw new Error(`Geen configuratie voor categorie ${category}`);

  const vatRate = config.vatRate / 100;
  const sellingPriceExcl = config.sellingPriceIncl / (1 + vatRate);
  const contribution = sellingPriceExcl - config.shippingCost;
  const maxPurchaseCost25pct = contribution * (1 - config.minMarginPct / 100);
  const maxPurchaseCostMinProfit = contribution - config.minProfit;
  const maxBudget = Math.min(maxPurchaseCost25pct, maxPurchaseCostMinProfit);

  // Get products already sent to this customer
  const previousOrders = await db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    with: { orderItems: true },
  });

  const usedProductIds = new Set<number>(
    previousOrders.flatMap((o) => (o as any).orderItems?.map((i: any) => i.productId) ?? [])
  );

  // Get all active products with stock > 0 that match this category
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      purchasePriceExcl: products.purchasePriceExcl,
      gender: products.gender,
      ageMin: products.ageMin,
      ageMax: products.ageMax,
      ean: products.ean,
      imageUrl: products.imageUrl,
      quantity: inventory.quantity,
    })
    .from(products)
    .innerJoin(inventory, eq(inventory.productId, products.id))
    .where(and(eq(products.isActive, true), gt(inventory.quantity, 0)));

  const eligible = allProducts.filter(
    (p) =>
      productMatchesCategory(p, category) &&
      !usedProductIds.has(p.id) &&
      p.purchasePriceExcl <= maxBudget
  );

  if (eligible.length < config.itemsCount) {
    return {
      category,
      items: [],
      totalPurchaseExcl: 0,
      sellingPriceIncl: config.sellingPriceIncl,
      sellingPriceExcl,
      shippingCost: config.shippingCost,
      vatOnSale: config.sellingPriceIncl - sellingPriceExcl,
      contribution,
      profit: 0,
      marginPct: 0,
      viable: false,
      reason:
        eligible.length === 0
          ? "Geen producten beschikbaar voor deze categorie"
          : `Te weinig producten beschikbaar (${eligible.length} van ${config.itemsCount} nodig)`,
    };
  }

  // Greedy selection: pick items to maximize variety while staying within budget
  const selected = selectItems(eligible, config.itemsCount, maxBudget);

  if (selected.length < config.itemsCount) {
    return {
      category,
      items: [],
      totalPurchaseExcl: 0,
      sellingPriceIncl: config.sellingPriceIncl,
      sellingPriceExcl,
      shippingCost: config.shippingCost,
      vatOnSale: config.sellingPriceIncl - sellingPriceExcl,
      contribution,
      profit: 0,
      marginPct: 0,
      viable: false,
      reason: "Pakket past niet binnen het budget met minimale winsteis",
    };
  }

  const totalPurchaseExcl = selected.reduce((s, p) => s + p.purchasePriceExcl, 0);
  const profit = contribution - totalPurchaseExcl;
  const marginPct = (profit / contribution) * 100;

  return {
    category,
    items: selected.map((p) => ({
      productId: p.id,
      name: p.name,
      purchasePriceExcl: p.purchasePriceExcl,
      ean: p.ean,
      imageUrl: p.imageUrl,
    })),
    totalPurchaseExcl,
    sellingPriceIncl: config.sellingPriceIncl,
    sellingPriceExcl,
    shippingCost: config.shippingCost,
    vatOnSale: config.sellingPriceIncl - sellingPriceExcl,
    contribution,
    profit,
    marginPct,
    viable: true,
  };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function greedyFill<T extends { id: number; purchasePriceExcl: number }>(
  pool: T[],
  slotsLeft: number,
  budget: number
): T[] {
  const result: T[] = [];
  let remaining = budget;
  for (const item of pool) {
    if (result.length >= slotsLeft) break;
    if (item.purchasePriceExcl <= remaining) {
      result.push(item);
      remaining -= item.purchasePriceExcl;
    }
  }
  return result;
}

function selectItems(
  eligible: Array<{ id: number; name: string; purchasePriceExcl: number; gender: string; ageMin: number; ageMax: number; ean: string | null; imageUrl: string | null; quantity: number }>,
  count: number,
  maxBudget: number
) {
  const EXPENSIVE_COUNT = 2;
  const cheapCount = count - EXPENSIVE_COUNT;

  // Split on median price: top half = expensive, bottom half = cheap
  const sorted = [...eligible].sort((a, b) => a.purchasePriceExcl - b.purchasePriceExcl);
  const splitIdx = Math.ceil(sorted.length / 2);
  const cheapPool = shuffle(sorted.slice(0, splitIdx));
  const expensivePool = shuffle(sorted.slice(splitIdx));

  // Only attempt tiered selection when both pools have enough items
  if (expensivePool.length >= EXPENSIVE_COUNT && cheapPool.length >= cheapCount) {
    // Try each combination: pick 2 from expensive, fill rest from cheap
    for (const exp of expensivePool) {
      const expCost = exp.purchasePriceExcl;
      const budgetForCheap = maxBudget - expCost;

      // Pick a second expensive item
      const secondCandidates = expensivePool.filter((p) => p.id !== exp.id);
      for (const exp2 of secondCandidates) {
        const twoExpCost = expCost + exp2.purchasePriceExcl;
        if (twoExpCost > maxBudget) continue;

        const budgetLeft = maxBudget - twoExpCost;
        const cheapFill = greedyFill(cheapPool.filter((p) => p.id !== exp.id && p.id !== exp2.id), cheapCount, budgetLeft);

        if (cheapFill.length === cheapCount) {
          return [exp, exp2, ...cheapFill];
        }
      }
    }
  }

  // Fallback: greedy shuffle (original behavior) when tiered selection fails
  const shuffled = shuffle(eligible);
  const selected: typeof eligible = [];
  let remaining = maxBudget;

  for (const item of shuffled) {
    if (selected.length >= count) break;
    const remainingSlots = count - selected.length;
    const minCostForRest = shuffled
      .filter((p) => !selected.includes(p) && p !== item)
      .sort((a, b) => a.purchasePriceExcl - b.purchasePriceExcl)
      .slice(0, remainingSlots - 1)
      .reduce((s, p) => s + p.purchasePriceExcl, 0);

    if (item.purchasePriceExcl + minCostForRest <= remaining) {
      selected.push(item);
      remaining -= item.purchasePriceExcl;
    }
  }

  return selected;
}

export async function calculateViability(category: Category): Promise<{
  totalProducts: number;
  totalStock: number;
  estimatedPackages: number;
  maxPurchaseBudget: number;
  avgPurchaseCost: number;
}> {
  const config = await db.query.packageConfigs.findFirst({
    where: eq(packageConfigs.category, category),
  });
  if (!config) throw new Error("Geen configuratie");

  const vatRate = config.vatRate / 100;
  const sellingPriceExcl = config.sellingPriceIncl / (1 + vatRate);
  const contribution = sellingPriceExcl - config.shippingCost;
  const maxBudget = Math.min(
    contribution * (1 - config.minMarginPct / 100),
    contribution - config.minProfit
  );

  const allProducts = await db
    .select({
      id: products.id,
      purchasePriceExcl: products.purchasePriceExcl,
      gender: products.gender,
      ageMin: products.ageMin,
      ageMax: products.ageMax,
      quantity: inventory.quantity,
    })
    .from(products)
    .innerJoin(inventory, eq(inventory.productId, products.id))
    .where(and(eq(products.isActive, true), gt(inventory.quantity, 0)));

  const matching = allProducts.filter(
    (p) => productMatchesCategory(p, category) && p.purchasePriceExcl <= maxBudget
  );

  const totalStock = matching.reduce((s, p) => s + p.quantity, 0);
  const avgCost = matching.length
    ? matching.reduce((s, p) => s + p.purchasePriceExcl, 0) / matching.length
    : 0;

  const avgPackageCost = avgCost * config.itemsCount;
  const estimatedPackages =
    avgPackageCost > 0 ? Math.floor(totalStock / config.itemsCount) : 0;

  return {
    totalProducts: matching.length,
    totalStock,
    estimatedPackages,
    maxPurchaseBudget: maxBudget,
    avgPurchaseCost: avgCost,
  };
}
