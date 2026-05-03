export interface CategorySuggestion {
  gender: "boy" | "girl" | "unisex";
  ageMin: number;
  ageMax: number;
  confidence: "high" | "medium" | "low";
}

// Keyword rules for gender and age — based on toy product names
const GIRL_KEYWORDS = [
  "barbie", "princess", "prinses", "frozen", "elsa", "anna", "pony", "unicorn",
  "eenhoorn", "polly pocket", "peppa pig", "peppa", "lol surprise", "lol", "glitter",
  "nail", "nagel", "beauty", "beautykoffer", "makeup", "make-up", "sieraden", "kralen",
  "modeontwerper", "designer", "encanto", "ariel", "belle", "aurora", "rapunzel",
  "tinker", "strikje", "vlinder", "butterfly", "pink", "roze", "hartje", "friends",
  "princess friends", "diamond painting", "my little pony", "lichtgirlande",
  "papierstroken", "sophie la girafe",
];

const BOY_KEYWORDS = [
  "nerf", "hot wheels", "matchbox", "cars", "monster truck", "voertuig", "auto",
  "tractor", "graafmachine", "bouwvoertuig", "truck", "crane", "helicopter",
  "vliegtuig foam", "star wars", "batman", "spider-man", "spiderman", "marvel",
  "avengers", "captain america", "iron man", "hulk", "thor", "minecraft",
  "pokémon", "pokemon", "pikachu", "dino", "dinosaur", "dinosaurus", "jurassic",
  "playmobil novelmore", "nerf nanofire", "dungeons dragons", "dragon", "ridder",
  "knight", "sword", "zwaard", "shield", "schild", "minions", "lightyear",
  "toy story", "buzz", "woody", "ghostbusters", "ninja", "army", "soldier",
  "racing", "race", "formule", "super wings", "robot", "transformers", "mega morphers",
  "airsoft",
];

const BABY_KEYWORDS = [
  "fisher-price", "fisher price", "ravensburger ministeps", "ministeps",
  "happy world stapel", "happy world bad", "happy world bio", "happy world motoriek",
  "happy world badeend", "happy world", "playgro", "knuffeldoekje", "rammelaar",
  "bijtring", "badspeelgoed", "bad bootjes", "stapelbekers", "vormenstoof",
  "motoriek", "zintuig ballen", "stokpaard rendier", "knuffeldoek",
  "escabbo zwemring", "zwemring", "baby", "peuter", "0-3", "0+", "1+", "2+",
  "puzzelvormen", "ijsbeer puzzel",
];

const OLDER_BOY_KEYWORDS = [
  "nerf elite", "nerf dungeons", "kosmos engineering", "makerspace", "robots",
  "star wars", "dungeons", "lego technic",
];

const YOUNG_UNISEX_KEYWORDS = [
  "play-doh", "playdoh", "klei", "stickers", "knutsel", "knutselset", "ses creative",
  "ses", "puzzel", "puzzle", "puzz", "verf", "schilderen", "tekenen", "tekening",
  "memory", "kaartspel", "spel", "game", "uno", "pong", "blindbag", "blind bag",
  "verrassingsei", "boomerang", "flyball", "foam vliegtuig", "glitterlijm",
  "weefraam", "jojo", "glow n fun", "glow in the dark",
];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export function suggestCategory(productName: string): CategorySuggestion {
  const name = productName.toLowerCase();

  // 1. Detect baby (0–3)
  if (containsAny(name, BABY_KEYWORDS)) {
    const gender = containsAny(name, GIRL_KEYWORDS) ? "girl"
      : containsAny(name, BOY_KEYWORDS) ? "boy"
      : "unisex";
    return { gender, ageMin: 0, ageMax: 3, confidence: "high" };
  }

  // 2. Detect explicit age hint in name (e.g. "4+", "6-8", "3 jaar")
  const ageHint = extractAgeHint(name);

  // 3. Detect gender
  const isGirl = containsAny(name, GIRL_KEYWORDS);
  const isBoy = containsAny(name, BOY_KEYWORDS) || containsAny(name, OLDER_BOY_KEYWORDS);
  const isUnisex = containsAny(name, YOUNG_UNISEX_KEYWORDS);

  let gender: "boy" | "girl" | "unisex" = "unisex";
  if (isGirl && !isBoy) gender = "girl";
  else if (isBoy && !isGirl) gender = "boy";
  else if (!isGirl && !isBoy) gender = "unisex";
  else gender = "unisex"; // both — default unisex

  // Older boy items tend toward 6-8
  const skewsOlder = containsAny(name, OLDER_BOY_KEYWORDS);

  // 4. Determine age range
  let ageMin = ageHint?.min ?? (skewsOlder ? 6 : 3);
  let ageMax = ageHint?.max ?? (skewsOlder ? 8 : 8);

  // Clamp to valid ranges
  ageMin = Math.max(0, Math.min(ageMin, 6));
  ageMax = Math.min(8, Math.max(ageMax, ageMin + 2));

  const confidence = ageHint ? "high" : (isGirl || isBoy) ? "medium" : "low";

  return { gender, ageMin, ageMax, confidence };
}

function extractAgeHint(name: string): { min: number; max: number } | null {
  // Patterns: "4+", "6+", "3-8", "3-5 jaar", "73pcs. 4+"
  const plusMatch = name.match(/\b(\d+)\s*\+/);
  if (plusMatch) {
    const min = parseInt(plusMatch[1]);
    return { min, max: min <= 3 ? 3 : min <= 5 ? 5 : 8 };
  }
  const rangeMatch = name.match(/\b(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  }
  return null;
}
