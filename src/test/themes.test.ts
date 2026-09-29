import { describe, it, expect } from "vitest";
import themes, { THEME_IDS } from "@/themes/themes";

describe("themes", () => {
  it("has 6 themes", () => {
    expect(THEME_IDS.length).toBe(6);
  });

  it("every theme has required fields", () => {
    for (const id of THEME_IDS) {
      const t = themes[id];
      expect(t.id).toBe(id);
      expect(t.bubbleColors.length).toBeGreaterThan(0);
      expect(typeof t.pitchOffset).toBe("number");
      expect(t.background).toMatch(/gradient/);
    }
  });

  it("every theme has scenery items", () => {
    for (const id of THEME_IDS) {
      const t = themes[id];
      expect(Array.isArray(t.scenery)).toBe(true);
      expect(t.scenery.length).toBeGreaterThan(0);
    }
  });

  it("every theme has popEmojis", () => {
    for (const id of THEME_IDS) {
      const t = themes[id];
      expect(Array.isArray(t.popEmojis)).toBe(true);
      expect(t.popEmojis.length).toBeGreaterThan(0);
    }
  });

  it("every theme has a bgPattern string", () => {
    for (const id of THEME_IDS) {
      expect(typeof themes[id].bgPattern).toBe("string");
      expect(themes[id].bgPattern.length).toBeGreaterThan(0);
    }
  });
});
