import { describe, it, expect, vi } from "vitest";
import { loadData } from "../js/lib.js";

/* ---------- Helpers ---------- */
const okRes = (data) => ({ ok: true, status: 200, json: () => Promise.resolve(data) });
const errRes = (status = 404) => ({ ok: false, status, json: () => Promise.resolve(null) });

const makeLatest = (...refs) => ({
  updated_at: "2026-05-28",
  dates: refs.map((ref, i) => ({ date: `2026-05-${28 - i}`, ref })),
});

const dayData = (date) => ({ published_at: `${date}T06:30:00+09:00`, categories: [] });

/* =========================================================
 * loadData — fetch fallback logic
 * ========================================================= */
describe("loadData", () => {
  it("returns data from the first available date file", async () => {
    const latest = makeLatest("2026-05-28.json", "2026-05-27.json");
    const expected = dayData("2026-05-28");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(okRes(latest))
      .mockResolvedValueOnce(okRes(expected));

    const result = await loadData(mockFetch, "data/latest.json");

    expect(result).toEqual(expected);
    expect(mockFetch).toHaveBeenNthCalledWith(2, "data/2026-05-28.json", { cache: "no-store" });
  });

  it("falls back to the next date when the first file returns 404", async () => {
    const latest = makeLatest("2026-05-28.json", "2026-05-27.json");
    const expected = dayData("2026-05-27");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(okRes(latest))
      .mockResolvedValueOnce(errRes(404))
      .mockResolvedValueOnce(okRes(expected));

    const result = await loadData(mockFetch, "data/latest.json");

    expect(result).toEqual(expected);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("falls back through all entries and returns the last available one", async () => {
    const latest = makeLatest("2026-05-28.json", "2026-05-27.json", "2026-05-26.json");
    const expected = dayData("2026-05-26");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(okRes(latest))
      .mockResolvedValueOnce(errRes())
      .mockResolvedValueOnce(errRes())
      .mockResolvedValueOnce(okRes(expected));

    const result = await loadData(mockFetch, "data/latest.json");
    expect(result).toEqual(expected);
  });

  it("throws 'No data files available' when all date files return 404", async () => {
    const latest = makeLatest("2026-05-28.json", "2026-05-27.json");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(okRes(latest))
      .mockResolvedValue(errRes());

    await expect(loadData(mockFetch, "data/latest.json"))
      .rejects.toThrow("No data files available");
  });

  it("throws an HTTP error when latest.json itself returns 404", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(errRes(404));

    await expect(loadData(mockFetch, "data/latest.json"))
      .rejects.toThrow("HTTP 404");
  });

  it("throws when the dates array is empty", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(okRes({ dates: [] }));

    await expect(loadData(mockFetch, "data/latest.json"))
      .rejects.toThrow("No data reference found in latest.json");
  });

  it("throws when the dates field is missing entirely", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(okRes({ updated_at: "2026-05-28" }));

    await expect(loadData(mockFetch, "data/latest.json"))
      .rejects.toThrow("No data reference found in latest.json");
  });

  it("skips entries that have no ref field", async () => {
    const latest = {
      updated_at: "2026-05-28",
      dates: [
        { date: "2026-05-28" },                              // no ref
        { date: "2026-05-27", ref: "2026-05-27.json" },
      ],
    };
    const expected = dayData("2026-05-27");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(okRes(latest))
      .mockResolvedValueOnce(okRes(expected));

    const result = await loadData(mockFetch, "data/latest.json");

    expect(result).toEqual(expected);
    // Only 2 calls: latest.json + 2026-05-27.json (the no-ref entry is skipped)
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(2, "data/2026-05-27.json", { cache: "no-store" });
  });

  it("passes the dataUrl argument to the first fetch call", async () => {
    const latest = makeLatest("2026-05-28.json");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(okRes(latest))
      .mockResolvedValueOnce(okRes(dayData("2026-05-28")));

    await loadData(mockFetch, "data/latest.json");

    expect(mockFetch).toHaveBeenNthCalledWith(1, "data/latest.json", { cache: "no-store" });
  });
});
