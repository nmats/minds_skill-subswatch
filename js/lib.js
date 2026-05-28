export const SECTION_ORDER = ["removed", "added", "updated"];

export const SECTION_META = {
  removed: { key: "items_removed", className: "sec-removed", dateField: "available_until" },
  added:   { key: "items_added",   className: "sec-added",   dateField: "available_from" },
  updated: { key: "items_updated", className: "sec-updated", dateField: null },
};

export const SERVICE_BRAND = {
  netflix_jp:                { abbr: "NF", bg: "#E50914", fg: "#ffffff" },
  disney_plus_jp:            { abbr: "D+", bg: "#113CCF", fg: "#ffffff" },
  amazon_prime_video_jp:     { abbr: "PV", bg: "#00A8E1", fg: "#ffffff" },
  hulu_jp:                   { abbr: "HU", bg: "#1CE783", fg: "#0a1f10" },
  apple_tv_plus_jp:          { abbr: "AT", bg: "#000000", fg: "#ffffff" },
  unext_jp:                  { abbr: "UN", bg: "#222222", fg: "#ffffff" },
  danime_store:              { abbr: "dA", bg: "#FF6B00", fg: "#ffffff" },
  spotify_jp:                { abbr: "SP", bg: "#1DB954", fg: "#0a1f10" },
  apple_music_jp:            { abbr: "AM", bg: "#FA243C", fg: "#ffffff" },
  amazon_music_jp:           { abbr: "AZ", bg: "#25D1DA", fg: "#0a1f25" },
  line_music_jp:             { abbr: "LM", bg: "#06C755", fg: "#ffffff" },
  youtube_music_jp:          { abbr: "YM", bg: "#FF0033", fg: "#ffffff" },
  ps_plus_jp:                { abbr: "PS", bg: "#0070D1", fg: "#ffffff" },
  xbox_game_pass_jp:         { abbr: "XG", bg: "#107C10", fg: "#ffffff" },
  nintendo_switch_online_jp: { abbr: "NS", bg: "#E60012", fg: "#ffffff" },
};

export const SERVICE_LABEL_EN = {
  danime_store: "d Anime Store",
};

export const I18N = {
  ja: {
    htmlLang: "ja",
    brandName: "SubsWatch",
    brandTag: "by Animoca Brands Japan",
    live: "LIVE",
    services: (n) => `${n} サービス`,
    heroEyebrow1: "毎朝 06:30 JST 更新",
    heroEyebrowToday: "本日",
    heroEyebrowEdition: "Edition 001",
    heroTitleA: "「気づいたら、消えてた」を、",
    heroTitleB: "なくす",
    heroTitleEnd: "。",
    heroSub: "映像・音楽・ゲームの15サービスから、今日終わる作品・新しく加わった作品を毎朝06:30 JSTにまとめてお届け。観られるうちに、観よう。",
    stat: {
      removed: "配信終了 / REMOVED",
      added: "新着追加 / ADDED",
      updated: "更新 / UPDATED",
    },
    sec: { removed: "配信終了", added: "新着追加", updated: "更新" },
    tabAll: "すべて",
    cat: { "映像": "映像", "音楽": "音楽", "ゲーム": "ゲーム" },
    svcCount: (n) => `${n} サービス`,
    itemUnit: "件",
    emptyDay: "本日の更新はありません",
    emptyDaySub: "15サービスを巡回しましたが、追加・終了・更新の差分は検出されませんでした。",
    emptyCat: "このカテゴリは本日の差分がありません。",
    fetchFail: "データを取得できませんでした",
    fetchFailSub: (e) => `data/latest.json の読み込みに失敗しました (${e})。`,
    datePrefixRemoved: "～",
    datePrefixAdded: "",
    footer: {
      a: "SubsWatch v1.0 · GitHub Pages 静的サイト",
      b: "Data:",
      bAfter: "· SubsWatch Publisher が毎日更新",
      c: "© 2026 Animoca Brands Japan",
    },
    formatTodayDate: (iso) => {
      const m = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return "本日";
      return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
    },
    formatItemDate: (iso) => {
      const m = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return null;
      return `${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
    },
    formatPublished: (iso) => {
      const m = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (!m) return iso;
      return `${m[1]}/${m[2]}/${m[3]} ${m[4]}:${m[5]} JST`;
    },
  },
  en: {
    htmlLang: "en",
    brandName: "SubsWatch",
    brandTag: "by Animoca Brands Japan",
    live: "LIVE",
    services: (n) => `${n} services`,
    heroEyebrow1: "Daily · 06:30 JST",
    heroEyebrowToday: "Today",
    heroEyebrowEdition: "Edition 001",
    heroTitleA: "Catch it",
    heroTitleB: "before it's gone",
    heroTitleEnd: ".",
    heroSub: "A daily brief on what's leaving and what's new across 15 video, music, and gaming services — delivered every morning at 06:30 JST. Watch it while you still can.",
    stat: {
      removed: "REMOVED / 配信終了",
      added: "ADDED / 新着追加",
      updated: "UPDATED / 更新",
    },
    sec: { removed: "Leaving", added: "New", updated: "Updated" },
    tabAll: "All",
    cat: { "映像": "Video", "音楽": "Music", "ゲーム": "Gaming" },
    svcCount: (n) => `${n} services`,
    itemUnit: "",
    emptyDay: "No updates today",
    emptyDaySub: "We checked all 15 services — nothing was added, removed, or updated.",
    emptyCat: "No changes in this category today.",
    fetchFail: "Couldn't load data",
    fetchFailSub: (e) => `Failed to fetch data/latest.json (${e}).`,
    datePrefixRemoved: "until ",
    datePrefixAdded: "from ",
    footer: {
      a: "SubsWatch v1.0 · Static site on GitHub Pages",
      b: "Data:",
      bAfter: "· Updated daily by SubsWatch Publisher",
      c: "© 2026 Animoca Brands Japan",
    },
    formatTodayDate: (iso) => {
      const m = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return "Today";
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${months[parseInt(m[2],10)-1]} ${parseInt(m[3], 10)}, ${m[1]}`;
    },
    formatItemDate: (iso) => {
      const m = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return null;
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${months[parseInt(m[2],10)-1]} ${parseInt(m[3], 10)}`;
    },
    formatPublished: (iso) => {
      const m = iso?.match?.(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (!m) return iso;
      return `${m[1]}/${m[2]}/${m[3]} ${m[4]}:${m[5]} JST`;
    },
  },
};

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

export const sumItems = (svc) =>
  (svc.items_removed?.length || 0) +
  (svc.items_added?.length || 0) +
  (svc.items_updated?.length || 0);

export const categoryTotals = (cat) => {
  let r = 0, a = 0, u = 0;
  for (const s of cat.services) {
    r += s.items_removed?.length || 0;
    a += s.items_added?.length || 0;
    u += s.items_updated?.length || 0;
  }
  return { removed: r, added: a, updated: u, total: r + a + u };
};

export const allTotals = (data) => {
  let r = 0, a = 0, u = 0;
  for (const c of data.categories) {
    const t = categoryTotals(c);
    r += t.removed; a += t.added; u += t.updated;
  }
  return { removed: r, added: a, updated: u };
};

export const totalServices = (data) =>
  data.categories.reduce((n, c) => n + c.services.length, 0);

export const serviceLabel = (svc, lang) =>
  (lang === "en" && SERVICE_LABEL_EN[svc.service_id]) || svc.service_label;

export function applyDataset(raw, mode) {
  if (mode === "empty") {
    return {
      ...raw,
      categories: raw.categories.map((c) => ({
        ...c,
        services: c.services.map((s) => ({
          ...s, items_removed: [], items_added: [], items_updated: [],
        })),
      })),
    };
  }
  if (mode === "quiet") {
    return {
      ...raw,
      categories: raw.categories.map((c) => ({
        ...c,
        services: c.services.map((s, i) => ({
          ...s,
          items_removed: i % 2 === 0 ? s.items_removed.slice(0, 1) : [],
          items_added:   i % 3 === 0 ? s.items_added.slice(0, 1)   : [],
          items_updated: [],
        })),
      })),
    };
  }
  return raw;
}

export async function loadData(fetchFn, dataUrl) {
  const ptrRes = await fetchFn(dataUrl, { cache: "no-store" });
  if (!ptrRes.ok) throw new Error(`HTTP ${ptrRes.status}`);
  const ptr = await ptrRes.json();
  const dates = ptr.dates;
  if (!dates?.length) throw new Error("No data reference found in latest.json");
  let raw = null;
  for (const entry of dates) {
    if (!entry?.ref) continue;
    const res = await fetchFn("data/" + entry.ref, { cache: "no-store" });
    if (res.ok) { raw = await res.json(); break; }
  }
  if (!raw) throw new Error("No data files available");
  return raw;
}
