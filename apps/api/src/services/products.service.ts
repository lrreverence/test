import { env } from "../config/env.js";

export const locales = ["en", "nl", "de", "fr"] as const;
export type Locale = (typeof locales)[number];

type RawProduct = Record<string, unknown> & {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  nutriments?: Record<string, unknown>;
  nutrition_grades?: string;
};

export type Nutrition = {
  energyKcal: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
};

export type Product = {
  code: string;
  name: string;
  genericName: string | null;
  brand: string;
  imageUrl: string | null;
  nutritionGrade: string | null;
  nutrition: Nutrition | null;
};

const firstText = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

const numberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export function mapProduct(raw: RawProduct, locale: Locale, includeNutrition: boolean): Product {
  const localizedName = raw[`product_name_${locale}`];
  const localizedGenericName = raw[`generic_name_${locale}`];
  const nutriments = raw.nutriments ?? {};

  return {
    code: firstText(raw.code) ?? "unknown",
    name: firstText(localizedName, raw.product_name, raw.product_name_en) ?? "Unnamed product",
    genericName: firstText(localizedGenericName, raw.generic_name, raw.generic_name_en),
    brand: firstText(raw.brands) ?? "Unknown brand",
    imageUrl: firstText(raw.image_front_url, raw.image_front_small_url),
    nutritionGrade: firstText(raw.nutrition_grades)?.toUpperCase() ?? null,
    nutrition: includeNutrition
      ? {
          energyKcal: numberOrNull(nutriments["energy-kcal_100g"]),
          fat: numberOrNull(nutriments.fat_100g),
          saturatedFat: numberOrNull(nutriments["saturated-fat_100g"]),
          carbohydrates: numberOrNull(nutriments.carbohydrates_100g),
          sugars: numberOrNull(nutriments.sugars_100g),
          protein: numberOrNull(nutriments.proteins_100g),
          salt: numberOrNull(nutriments.salt_100g)
        }
      : null
  };
}

export async function searchOpenFoodFacts(query: string, locale: Locale, includeNutrition: boolean): Promise<Product[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.search = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "12",
    lc: locale,
    fields: [
      "code", "product_name", "product_name_en", `product_name_${locale}`,
      "generic_name", "generic_name_en", `generic_name_${locale}`,
      "brands", "image_front_url", "image_front_small_url", "nutrition_grades", "nutriments"
    ].join(",")
  }).toString();

  const response = await fetch(url, {
    headers: { "User-Agent": env.OPEN_FOOD_FACTS_USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) throw new Error(`Open Food Facts returned ${response.status}`);
  const data = (await response.json()) as { products?: RawProduct[] };
  return (data.products ?? []).map((product) => mapProduct(product, locale, includeNutrition));
}

