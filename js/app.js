/* =========================================================
 * SubsWatch — fetch + render
 * Pure vanilla JS. Reads /data/latest.json on load.
 * ========================================================= */

(() => {
  "use strict";

  /* ---------- Constants ---------- */
  const DATA_URL = "data/latest.json";

  // Section order — items_removed FIRST (highest priority per brief)
  const SECTION_ORDER = ["removed", "added", "updated"];

  const SECTION_META = {
    removed: { key: "items_removed", className: "sec-removed", dateField: "available_until" },
    added:   { key: "items_added",   className: "sec-added",   dateField: "available_from" },
    updated: { key: "items_updated", className: "sec-updated", dateField: null }, // no date pill for updated
  };

  // Service identity — brand color + 2-letter monogram. No logo recreation.
  // Colors approximate each service's primary brand color so users can
  // recognise services by color at a glance.
  const SERVICE_BRAND = {
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

  // English service labels for language switch
  const SERVICE_LABEL_EN = {
    danime_store: "d Anime Store",
  };

  // Localised strings
  const I18N = {
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

  /* ---------- DOM refs ---------- */
  const $ = (sel) => document.querySelector(sel);

  /* ---------- State ---------- */
  let RAW = null;
  let DATA = null;
  let activeTab = "all";

  /* ---------- Helpers ---------- */
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const sumItems = (svc) =>
    (svc.items_removed?.length || 0) +
    (svc.items_added?.length || 0) +
    (svc.items_updated?.length || 0);

  const categoryTotals = (cat) => {
    let r = 0, a = 0, u = 0;
    for (const s of cat.services) {
      r += s.items_removed?.length || 0;
      a += s.items_added?.length || 0;
      u += s.items_updated?.length || 0;
    }
    return { removed: r, added: a, updated: u, total: r + a + u };
  };

  const allTotals = (data) => {
    let r = 0, a = 0, u = 0;
    for (const c of data.categories) {
      const t = categoryTotals(c);
      r += t.removed; a += t.added; u += t.updated;
    }
    return { removed: r, added: a, updated: u };
  };

  const totalServices = (data) =>
    data.categories.reduce((n, c) => n + c.services.length, 0);

  const serviceLabel = (svc, lang) =>
    (lang === "en" && SERVICE_LABEL_EN[svc.service_id]) || svc.service_label;

  /* ---------- Tweaks (data-set transforms) ---------- */
  function applyDataset(raw, mode) {
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

  /* ---------- Rendering ---------- */
  function renderChrome(data) {
    const t = I18N[tweakState.lang];
    document.documentElement.lang = t.htmlLang;

    // brand / topbar text
    $(".brand-name").textContent = t.brandName;
    $(".brand-mute").textContent = t.brandTag;
    $("#published-at").textContent = t.formatPublished(data.published_at);

    // hero text
    $("#hero-title-a").textContent = t.heroTitleA;
    $("#hero-title-b").textContent = t.heroTitleB;
    $("#hero-title-end").textContent = t.heroTitleEnd;
    $("#hero-sub").textContent = t.heroSub;

    // footer
    $("#foot-a").textContent = t.footer.a;
    $("#foot-b").textContent = t.footer.b;
    $("#foot-b-after").textContent = t.footer.bAfter;
    $("#foot-c").textContent = t.footer.c;

    // unit on stat numbers — no-op now (hero stats removed)

    // lang switch state
    document.querySelectorAll("#lang-switch button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.lang === tweakState.lang))
    );
  }

  function renderHeroStats() { /* hero stats removed */ }

  function renderTabs(data) {
    const t = I18N[tweakState.lang];
    const $tabs = $("#tabs");

    const items = [
      { id: "all", label: t.tabAll, count: data.categories.reduce((n, c) => n + categoryTotals(c).total, 0) },
      ...data.categories.map((c) => ({
        id: c.category_id,
        label: t.cat[c.category_id] || c.category_id,
        count: categoryTotals(c).total,
      })),
    ];

    $tabs.innerHTML = items
      .map(
        (it) => `
        <button class="tab" role="tab" data-tab="${escapeHtml(it.id)}"
                aria-selected="${it.id === activeTab}">
          <span>${escapeHtml(it.label)}</span>
          <span class="tab-count">${it.count}</span>
        </button>`
      )
      .join("");

    $tabs.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        $tabs.querySelectorAll(".tab").forEach((b) =>
          b.setAttribute("aria-selected", String(b.dataset.tab === activeTab))
        );
        renderMain(DATA);
      });
    });
  }

  function renderService(svc, idx) {
    const t = I18N[tweakState.lang];
    const brand = SERVICE_BRAND[svc.service_id] || { abbr: svc.service_label.slice(0, 2).toUpperCase(), bg: null, fg: null };
    const abbr = brand.abbr;
    const chipStyle = brand.bg
      ? `--chip-bg:${brand.bg};--chip-fg:${brand.fg};`
      : "";
    const total = sumItems(svc);

    if (total === 0) return ""; // skip empty service blocks

    const sections = SECTION_ORDER.map((kind) => {
      const meta = SECTION_META[kind];
      const items = svc[meta.key] || [];
      if (items.length === 0) return ""; // hide empty section

      const datePrefix =
        kind === "removed" ? t.datePrefixRemoved :
        kind === "added"   ? t.datePrefixAdded   : "";

      const rows = items
        .map((it, i) => {
          // Pick a date field per section type
          let dateStr = null;
          if (meta.dateField) {
            dateStr = t.formatItemDate(it[meta.dateField]);
          } else {
            // updated — show available_from if present
            dateStr = t.formatItemDate(it.available_from);
          }

          const dateHtml = dateStr
            ? `<span class="date">${escapeHtml(datePrefix)}${escapeHtml(dateStr)}</span>`
            : "";

          const linkOpen = it.source_url
            ? `<a class="item-link" href="${escapeHtml(it.source_url)}" target="_blank" rel="noopener noreferrer">`
            : `<span class="item-link">`;
          const linkClose = it.source_url ? `</a>` : `</span>`;
          return `
          <li class="item">
            ${linkOpen}
              <span class="marker">${String(i + 1).padStart(2, "0")}</span>
              <span class="title">${escapeHtml(it.item_title)}</span>
              ${dateHtml}
              ${it.source_url ? `<span class="arrow">→</span>` : ""}
            ${linkClose}
          </li>`;
        })
        .join("");
      return `
        <section class="svc-section ${meta.className}">
          <header class="sec-head">
            <span class="swatch"></span>
            <span class="label">${escapeHtml(t.sec[kind])}</span>
            <span class="num">${items.length}</span>
          </header>
          <ul class="items">${rows}</ul>
        </section>`;
    }).join("");

    const unit = t.itemUnit
      ? `<span class="unit">${escapeHtml(t.itemUnit)}</span>`
      : "";

    const removedN = svc.items_removed?.length || 0;
    const removedNote = removedN > 0
      ? `<span class="removed-note">うち配信終了 ${removedN} 件</span>`
      : "";

    return `
      <article class="svc-card" style="--i:${idx};${chipStyle}">
        <header class="svc-head">
          <div class="svc-name">${escapeHtml(serviceLabel(svc, tweakState.lang))}</div>
          <div class="svc-count${removedN > 0 ? " has-removed" : ""}">
            <span class="num">${total}${unit}</span>
            ${removedNote}
          </div>
        </header>
        ${sections}
      </article>`;
  }

  function renderMain(data) {
    const t = I18N[tweakState.lang];
    const $main = $("#main");

    const totals = allTotals(data);
    const grandTotal = totals.removed + totals.added + totals.updated;

    if (grandTotal === 0) {
      $main.innerHTML = `
        <div class="empty-day fade-in">
          <div class="big">${escapeHtml(t.emptyDay)}</div>
          <div>${escapeHtml(t.emptyDaySub)}</div>
        </div>`;
      return;
    }

    const cats = activeTab === "all"
      ? data.categories
      : data.categories.filter((c) => c.category_id === activeTab);

    const html = cats.map((cat, catIdx) => {
      const ct = categoryTotals(cat);
      const catLabel = t.cat[cat.category_id] || cat.category_id;

      const cards = cat.services
        .filter((s) => sumItems(s) > 0)
        .map((s, i) => renderService(s, i))
        .join("");

      const body =
        ct.total === 0
          ? `<div class="empty-cat">${escapeHtml(t.emptyCat)}</div>`
          : `<div class="svc-grid">${cards}</div>`;

      return `
        <section class="cat-section" style="margin-bottom: var(--section-gap);">
          <header class="cat-header">
            <h2 class="cat-title">
              <span class="cat-num">${String(catIdx + 1).padStart(2, "0")}</span>
              ${escapeHtml(catLabel)}
              <span class="cat-svc-count">${escapeHtml(t.svcCount(cat.services.length))}</span>
            </h2>
            <div class="cat-meta">
              ${ct.removed > 0 ? `<span class="cat-meta-item cat-meta-removed"><span class="cat-meta-num">${ct.removed}</span> 配信終了</span>` : ""}
              ${ct.added > 0 ? `<span class="cat-meta-item cat-meta-added"><span class="cat-meta-num">${ct.added}</span> 新着追加</span>` : ""}
              ${ct.updated > 0 ? `<span class="cat-meta-item cat-meta-updated"><span class="cat-meta-num">${ct.updated}</span> 更新</span>` : ""}
            </div>
          </header>
          ${body}
        </section>`;
    }).join("");

    $main.innerHTML = html;
  }

  function renderAll() {
    if (!DATA) return;
    renderChrome(DATA);
    renderHeroStats(DATA);
    renderTabs(DATA);
    renderMain(DATA);
  }

  /* ---------- Tweaks state ---------- */
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "density": "comfortable",
    "dataset": "normal",
    "lang": "ja"
  }/*EDITMODE-END*/;

  const tweakState = { ...TWEAK_DEFAULTS };

  function applyDensity(v) { document.documentElement.setAttribute("data-density", v); }

  function persistTweaks(partial) {
    Object.assign(tweakState, partial);
    try {
      window.parent.postMessage(
        { type: "__edit_mode_set_keys", edits: partial },
        "*"
      );
    } catch (e) {}
  }

  function setLang(v) {
    tweakState.lang = v;
    persistTweaks({ lang: v });
    renderAll();
    // sync tweaks panel
    const panel = document.getElementById("tweaks");
    if (panel) {
      panel.querySelectorAll('.tw-seg[data-key="lang"] button').forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.v === v))
      );
    }
  }

  /* ---------- Tweaks panel ---------- */
  function renderTweaks() {
    const panel = document.getElementById("tweaks");
    panel.innerHTML = `
      <h3>
        <span>Tweaks</span>
        <button class="close" id="tw-close" aria-label="Close">✕</button>
      </h3>

      <div class="tw-row">
        <label>Density</label>
        <div class="tw-seg" data-key="density">
          <button data-v="comfortable" aria-pressed="${tweakState.density === "comfortable"}">Comfortable</button>
          <button data-v="compact"     aria-pressed="${tweakState.density === "compact"}">Compact</button>
        </div>
      </div>

      <div class="tw-row">
        <label>Dataset (preview)</label>
        <div class="tw-seg" data-key="dataset">
          <button data-v="normal" aria-pressed="${tweakState.dataset === "normal"}">Normal</button>
          <button data-v="quiet"  aria-pressed="${tweakState.dataset === "quiet"}">Quiet</button>
          <button data-v="empty"  aria-pressed="${tweakState.dataset === "empty"}">Empty</button>
        </div>
      </div>

      <div style="font-family: var(--f-mono); font-size: 10px; color: var(--fg-mute); letter-spacing: 0.04em; margin-top: 4px;">
        DATA URL · data/latest.json
      </div>
    `;

    panel.querySelectorAll(".tw-seg").forEach((seg) => {
      seg.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-v]");
        if (!btn) return;
        const key = seg.dataset.key;
        const v = btn.dataset.v;
        if (key === "density") applyDensity(v);
        if (key === "dataset") {
          DATA = applyDataset(RAW, v);
          renderAll();
        }
        if (key === "lang") {
          tweakState.lang = v;
          renderAll();
        }
        persistTweaks({ [key]: v });
        seg.querySelectorAll("button").forEach((b) =>
          b.setAttribute("aria-pressed", String(b.dataset.v === v))
        );
      });
    });

    document.getElementById("tw-close").addEventListener("click", () => {
      panel.classList.remove("is-open");
      try {
        window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
      } catch (e) {}
    });
  }

  function wireEditMode() {
    window.addEventListener("message", (e) => {
      const t = e.data && e.data.type;
      if (t === "__activate_edit_mode") {
        document.getElementById("tweaks").classList.add("is-open");
      } else if (t === "__deactivate_edit_mode") {
        document.getElementById("tweaks").classList.remove("is-open");
      }
    });
    try {
      window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch (e) {}
  }

  function wireLangSwitch() {
    document.querySelectorAll("#lang-switch button").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
  }

  /* ---------- Boot ---------- */
  async function boot() {
    applyDensity(tweakState.density);

    renderTweaks();
    wireEditMode();
    wireLangSwitch();

    const $main = $("#main");
    $main.innerHTML = `
      <div class="svc-grid">
        ${Array.from({ length: 6 }, () => `<div class="skeleton-card"></div>`).join("")}
      </div>`;

    try {
      const ptrRes = await fetch(DATA_URL, { cache: "no-store" });
      if (!ptrRes.ok) throw new Error(`HTTP ${ptrRes.status}`);
      const ptr = await ptrRes.json();
      const latestRef = ptr.dates?.[0]?.ref;
      if (!latestRef) throw new Error("No data reference found in latest.json");
      const res = await fetch("data/" + latestRef, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      RAW = await res.json();
    } catch (err) {
      console.error("[SubsWatch] failed to load data:", err);
      const t = I18N[tweakState.lang];
      $main.innerHTML = `
        <div class="empty-day">
          <div class="big">${escapeHtml(t.fetchFail)}</div>
          <div>${escapeHtml(t.fetchFailSub(String(err.message || err)))}</div>
        </div>`;
      return;
    }

    DATA = applyDataset(RAW, tweakState.dataset);
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
