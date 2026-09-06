import { describe, expect, it } from "vitest";
import { mapProduct } from "../src/services/products.service.js";

describe("mapProduct", () => {
  const raw = {
    code: "123",
    product_name: "Fallback name",
    product_name_fr: "Nom français",
    generic_name_fr: "Biscuits au chocolat",
    brands: "Example Foods",
    image_front_url: "https://images.openfoodfacts.org/product.png",
    nutrition_grades: "b",
    nutriments: { "energy-kcal_100g": 210, fat_100g: 8.2, proteins_100g: 4.1 }
  };

  it("prefers translated product fields", () => {
    const product = mapProduct(raw, "fr", true);
    expect(product.name).toBe("Nom français");
    expect(product.genericName).toBe("Biscuits au chocolat");
    expect(product.nutritionGrade).toBe("B");
  });

  it("falls back safely when fields are incomplete", () => {
    const product = mapProduct({ code: "9" }, "nl", true);
    expect(product).toMatchObject({ name: "Unnamed product", brand: "Unknown brand", imageUrl: null });
    expect(product.nutrition?.salt).toBeNull();
  });

  it("does not serialize nutrition for a free user", () => {
    expect(mapProduct(raw, "en", false).nutrition).toBeNull();
  });
});

