import { describe, expect, it } from "vitest";
import {
  filterTagSuggestions,
  normalizeTag,
  normalizeTags,
} from "@/lib/tags";

describe("normalizeTag", () => {
  it("trims and lowercases", () => {
    expect(normalizeTag("  Design  ")).toBe("design");
    expect(normalizeTag("REACT")).toBe("react");
  });
});

describe("normalizeTags", () => {
  it("dedupes after normalization, preserving first-seen order", () => {
    expect(normalizeTags(["Design", " NYC ", "design", "design "])).toEqual([
      "design",
      "nyc",
    ]);
  });

  it("drops empty strings", () => {
    expect(normalizeTags(["a", "", "  ", "b"])).toEqual(["a", "b"]);
  });
});

describe("filterTagSuggestions", () => {
  const all = ["ai", "design", "designer", "nyc", "react"];

  it("returns prefix matches case-insensitively", () => {
    expect(filterTagSuggestions(all, "Des")).toEqual(["design", "designer"]);
  });

  it("returns all under limit when query is empty", () => {
    expect(filterTagSuggestions(all, "", 3)).toEqual(["ai", "design", "designer"]);
  });

  it("excludes already-selected tags", () => {
    expect(
      filterTagSuggestions(all, "de", 5, ["design"]),
    ).toEqual(["designer"]);
  });
});
