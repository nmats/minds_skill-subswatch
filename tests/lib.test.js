import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  sumItems,
  categoryTotals,
  allTotals,
  totalServices,
  serviceLabel,
  applyDataset,
  I18N,
} from "../js/lib.js";

/* ---------- Fixtures ---------- */
const item = (title, opts = {}) => ({ item_title: title, available_from: null, available_until: null, ...opts });
const makeSvc = (removed = [], added = [], updated = [], id = "netflix_jp") => ({
  service_id: id,
  service_label: "Netflix",
  items_removed: removed,
  items_added: added,
  items_updated: updated,
});
const makeCat = (id, services) => ({ category_id: id, services });
const makeData = (categories) => ({ published_at: "2026-05-27T10:00:00+09:00", categories });

/* =========================================================
 * escapeHtml
 * ========================================================= */
describe("escapeHtml", () => {
  it("escapes all five special characters", () => {
    expect(escapeHtml('&<>"\'')).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
  it("leaves safe strings unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
  it("coerces non-string values to string", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(null)).toBe("null");
  });
});

/* =========================================================
 * sumItems
 * ========================================================= */
describe("sumItems", () => {
  it("sums removed + added + updated", () => {
    const svc = makeSvc([item("R")], [item("A1"), item("A2")], [item("U")]);
    expect(sumItems(svc)).toBe(4);
  });
  it("returns 0 for empty service", () => {
    expect(sumItems(makeSvc())).toBe(0);
  });
  it("handles missing array fields gracefully", () => {
    expect(sumItems({ service_id: "x", service_label: "X" })).toBe(0);
  });
});

/* =========================================================
 * categoryTotals
 * ========================================================= */
describe("categoryTotals", () => {
  it("aggregates across all services in a category", () => {
    const cat = makeCat("映像", [
      makeSvc([item("R")], [item("A1"), item("A2")], []),
      makeSvc([], [], [item("U")]),
    ]);
    expect(categoryTotals(cat)).toEqual({ removed: 1, added: 2, updated: 1, total: 4 });
  });
  it("returns all-zero for empty category", () => {
    const cat = makeCat("映像", [makeSvc()]);
    expect(categoryTotals(cat)).toEqual({ removed: 0, added: 0, updated: 0, total: 0 });
  });
  it("total equals removed + added + updated", () => {
    const cat = makeCat("音楽", [makeSvc([item("R")], [item("A")], [item("U")])]);
    const t = categoryTotals(cat);
    expect(t.total).toBe(t.removed + t.added + t.updated);
  });
});

/* =========================================================
 * allTotals
 * ========================================================= */
describe("allTotals", () => {
  it("aggregates totals across all categories", () => {
    const data = makeData([
      makeCat("映像", [makeSvc([item("R")], [], [])]),
      makeCat("音楽", [makeSvc([], [item("A")], [])]),
      makeCat("ゲーム", [makeSvc([], [], [item("U")])]),
    ]);
    expect(allTotals(data)).toEqual({ removed: 1, added: 1, updated: 1 });
  });
  it("returns zeros for empty data", () => {
    const data = makeData([makeCat("映像", [makeSvc()])]);
    expect(allTotals(data)).toEqual({ removed: 0, added: 0, updated: 0 });
  });
});

/* =========================================================
 * totalServices
 * ========================================================= */
describe("totalServices", () => {
  it("counts all services across categories", () => {
    const data = makeData([
      makeCat("映像", [makeSvc(), makeSvc()]),
      makeCat("音楽", [makeSvc()]),
    ]);
    expect(totalServices(data)).toBe(3);
  });
  it("returns 0 when there are no services", () => {
    expect(totalServices(makeData([makeCat("映像", [])]))).toBe(0);
  });
});

/* =========================================================
 * serviceLabel
 * ========================================================= */
describe("serviceLabel", () => {
  it("returns service_label for Japanese", () => {
    const svc = { service_id: "netflix_jp", service_label: "Netflix" };
    expect(serviceLabel(svc, "ja")).toBe("Netflix");
  });
  it("returns English override for danime_store", () => {
    const svc = { service_id: "danime_store", service_label: "dアニメストア" };
    expect(serviceLabel(svc, "en")).toBe("d Anime Store");
  });
  it("returns service_label for services without English override", () => {
    const svc = { service_id: "netflix_jp", service_label: "Netflix" };
    expect(serviceLabel(svc, "en")).toBe("Netflix");
  });
  it("returns service_label for danime_store in Japanese", () => {
    const svc = { service_id: "danime_store", service_label: "dアニメストア" };
    expect(serviceLabel(svc, "ja")).toBe("dアニメストア");
  });
});

/* =========================================================
 * applyDataset
 * ========================================================= */
describe("applyDataset", () => {
  const raw = makeData([
    makeCat("映像", [
      makeSvc([item("R1"), item("R2")], [item("A1"), item("A2")], [item("U1")]),
      makeSvc([item("R3")], [item("A3")], [item("U2")]),
    ]),
  ]);

  describe("normal mode", () => {
    it("returns the raw object as-is", () => {
      expect(applyDataset(raw, "normal")).toBe(raw);
    });
  });

  describe("empty mode", () => {
    it("clears all item arrays", () => {
      const result = applyDataset(raw, "empty");
      for (const cat of result.categories) {
        for (const svc of cat.services) {
          expect(svc.items_removed).toEqual([]);
          expect(svc.items_added).toEqual([]);
          expect(svc.items_updated).toEqual([]);
        }
      }
    });
    it("preserves non-item fields", () => {
      const result = applyDataset(raw, "empty");
      expect(result.published_at).toBe(raw.published_at);
      expect(result.categories[0].category_id).toBe("映像");
      expect(result.categories[0].services[0].service_id).toBe("netflix_jp");
    });
    it("does not mutate the original raw object", () => {
      applyDataset(raw, "empty");
      expect(raw.categories[0].services[0].items_removed.length).toBe(2);
    });
  });

  describe("quiet mode", () => {
    it("always clears items_updated", () => {
      const result = applyDataset(raw, "quiet");
      for (const cat of result.categories) {
        for (const svc of cat.services) {
          expect(svc.items_updated).toEqual([]);
        }
      }
    });
    it("keeps at most 1 removed item for even-indexed services", () => {
      const result = applyDataset(raw, "quiet");
      expect(result.categories[0].services[0].items_removed.length).toBe(1); // index 0, even
      expect(result.categories[0].services[1].items_removed).toEqual([]);    // index 1, odd
    });
    it("keeps at most 1 added item for services at index divisible by 3", () => {
      const result = applyDataset(raw, "quiet");
      expect(result.categories[0].services[0].items_added.length).toBe(1);   // index 0, 0%3===0
      expect(result.categories[0].services[1].items_added).toEqual([]);       // index 1, 1%3!==0
    });
    it("does not mutate the original raw object", () => {
      applyDataset(raw, "quiet");
      expect(raw.categories[0].services[0].items_removed.length).toBe(2);
    });
  });
});

/* =========================================================
 * I18N.ja formatters
 * ========================================================= */
describe("I18N.ja formatters", () => {
  const { formatTodayDate, formatItemDate, formatPublished } = I18N.ja;

  describe("formatTodayDate", () => {
    it("formats a valid ISO date string in Japanese", () => {
      expect(formatTodayDate("2026-05-27")).toBe("2026年5月27日");
    });
    it("strips leading zeros from month and day", () => {
      expect(formatTodayDate("2026-01-05")).toBe("2026年1月5日");
    });
    it('returns "本日" for null', () => {
      expect(formatTodayDate(null)).toBe("本日");
    });
    it('returns "本日" for invalid string', () => {
      expect(formatTodayDate("not-a-date")).toBe("本日");
    });
  });

  describe("formatItemDate", () => {
    it("formats month and day in Japanese", () => {
      expect(formatItemDate("2026-05-27")).toBe("5月27日");
    });
    it("strips leading zeros", () => {
      expect(formatItemDate("2026-01-09")).toBe("1月9日");
    });
    it("returns null for null input", () => {
      expect(formatItemDate(null)).toBeNull();
    });
    it("returns null for invalid string", () => {
      expect(formatItemDate("invalid")).toBeNull();
    });
  });

  describe("formatPublished", () => {
    it("formats a valid ISO datetime", () => {
      expect(formatPublished("2026-05-27T10:20:00+09:00")).toBe("2026/05/27 10:20 JST");
    });
    it("returns the input as-is for invalid format", () => {
      expect(formatPublished("invalid")).toBe("invalid");
    });
  });
});

/* =========================================================
 * I18N.en formatters
 * ========================================================= */
describe("I18N.en formatters", () => {
  const { formatTodayDate, formatItemDate, formatPublished } = I18N.en;

  describe("formatTodayDate", () => {
    it("formats a valid ISO date string in English", () => {
      expect(formatTodayDate("2026-05-27")).toBe("May 27, 2026");
    });
    it("formats a January date correctly", () => {
      expect(formatTodayDate("2026-01-05")).toBe("Jan 5, 2026");
    });
    it('returns "Today" for invalid input', () => {
      expect(formatTodayDate(null)).toBe("Today");
      expect(formatTodayDate("bad")).toBe("Today");
    });
  });

  describe("formatItemDate", () => {
    it("formats month and day in English", () => {
      expect(formatItemDate("2026-05-27")).toBe("May 27");
    });
    it("returns null for invalid input", () => {
      expect(formatItemDate(null)).toBeNull();
    });
  });

  describe("formatPublished", () => {
    it("formats a valid ISO datetime the same as ja", () => {
      expect(formatPublished("2026-05-27T10:20:00+09:00")).toBe("2026/05/27 10:20 JST");
    });
  });
});
