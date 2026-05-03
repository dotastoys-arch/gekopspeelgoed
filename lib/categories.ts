import type { Category } from "./db/schema";

export const CATEGORY_LABELS: Record<Category, string> = {
  baby_0_3: "Baby 0–3 jaar",
  boys_3_5: "Jongens 3–5 jaar",
  boys_6_8: "Jongens 6–8 jaar",
  girls_3_5: "Meisjes 3–5 jaar",
  girls_6_8: "Meisjes 6–8 jaar",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  baby_0_3: "👶",
  boys_3_5: "🚀",
  boys_6_8: "⚡",
  girls_3_5: "🌸",
  girls_6_8: "✨",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  baby_0_3: "#FFD166",
  boys_3_5: "#4ECDC4",
  boys_6_8: "#45B7D1",
  girls_3_5: "#F8A5C2",
  girls_6_8: "#A29BFE",
};

export const CATEGORIES: Category[] = [
  "baby_0_3",
  "boys_3_5",
  "boys_6_8",
  "girls_3_5",
  "girls_6_8",
];

// Dutch URL slugs for each category
export const CATEGORY_SLUG: Record<Category, string> = {
  baby_0_3: "baby-0-3",
  boys_3_5: "jongens-3-5",
  boys_6_8: "jongens-6-8",
  girls_3_5: "meisjes-3-5",
  girls_6_8: "meisjes-6-8",
};

export const SLUG_TO_CATEGORY: Record<string, Category> = {
  "baby-0-3": "baby_0_3",
  "jongens-3-5": "boys_3_5",
  "jongens-6-8": "boys_6_8",
  "meisjes-3-5": "girls_3_5",
  "meisjes-6-8": "girls_6_8",
  // keep old slugs working as fallback
  "baby_0_3": "baby_0_3",
  "boys_3_5": "boys_3_5",
  "boys_6_8": "boys_6_8",
  "girls_3_5": "girls_3_5",
  "girls_6_8": "girls_6_8",
};

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "–";
  try {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
