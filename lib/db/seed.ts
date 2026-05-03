/**
 * Run once after setting up Supabase:  npm run db:seed
 * Seeds the default package configurations.
 */
import { db } from "./index";
import { packageConfigs } from "./schema";

async function seed() {
  console.log("Seeding package configs...");

  await db
    .insert(packageConfigs)
    .values([
      { category: "baby_0_3", sellingPriceIncl: 34.95, itemsCount: 6, minMarginPct: 25, minProfit: 5.0, shippingCost: 4.95, vatRate: 21.0 },
      { category: "boys_3_5", sellingPriceIncl: 34.95, itemsCount: 6, minMarginPct: 25, minProfit: 5.0, shippingCost: 4.95, vatRate: 21.0 },
      { category: "boys_6_8", sellingPriceIncl: 34.95, itemsCount: 6, minMarginPct: 25, minProfit: 5.0, shippingCost: 4.95, vatRate: 21.0 },
      { category: "girls_3_5", sellingPriceIncl: 34.95, itemsCount: 6, minMarginPct: 25, minProfit: 5.0, shippingCost: 4.95, vatRate: 21.0 },
      { category: "girls_6_8", sellingPriceIncl: 34.95, itemsCount: 6, minMarginPct: 25, minProfit: 5.0, shippingCost: 4.95, vatRate: 21.0 },
    ])
    .onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
