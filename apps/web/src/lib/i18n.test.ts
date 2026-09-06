import { describe, expect, it } from "vitest";
import { copy, localeOptions } from "./i18n";

describe("translations", () => {
  it("provides copy for each selectable locale", () => {
    expect(localeOptions.map(({ code }) => code)).toEqual(Object.keys(copy));
  });

  it("keeps every locale dictionary structurally complete", () => {
    const englishKeys = Object.keys(copy.en).sort();
    for (const locale of localeOptions) {
      expect(Object.keys(copy[locale.code]).sort()).toEqual(englishKeys);
      expect(Object.values(copy[locale.code]).every((value) => value.trim().length > 0)).toBe(true);
    }
  });
});
