import {
  SECTION_ORDER, SECTION_META, SERVICE_BRAND, I18N,
  escapeHtml, sumItems, categoryTotals, allTotals, serviceLabel,
  applyDataset, loadData,
} from "./lib.js";

const DATA_URL = "data/latest.json";

/* ---------- DOM refs ---------- */
const $ = (sel) => document.querySelector(sel);

/* ---------- State ---------- */
let RAW = null;
let DATA = null;
let activeTab = "all";

/* ---------- Tweaks state ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "dataset": "normal",
  "lang": "ja"
}/*EDITMODE-END*/;

const tweakState = { ...TWEAK_DEFAULTS };

/* ---------- Rendering ---------- */
function renderChrome(data) {
  const t = I18N[tweakState.lang];
  document.documentElement.lang = t.htmlLang;

  $(".brand-name").textContent = t.brandName;
  $(".brand-mute").textContent = t.brandTag;
  $("#published-at").textContent = t.formatPublished(data.published_at);

  $("#hero-title-a").textContent = t.heroTitleA;
  $("#hero-title-b").textContent = t.heroTitleB;
  $("#hero-title-end").textContent = t.heroTitleEnd;
  $("#hero-sub").textContent = t.heroSub;

  $("#foot-a").textContent = t.footer.a;
  $("#foot-b").textContent = t.footer.b;
  $("#foot-b-after").textContent = t.footer.bAfter;
  $("#foot-c").textContent = t.footer.c;

  document.querySelectorAll("#lang-switch button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.lang === tweakState.lang))
  );
}

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
  const chipStyle = brand.bg ? `--chip-bg:${brand.bg};--chip-fg:${brand.fg};` : "";
  const total = sumItems(svc);

  if (total === 0) return "";

  const sections = SECTION_ORDER.map((kind) => {
    const meta = SECTION_META[kind];
    const items = svc[meta.key] || [];
    if (items.length === 0) return "";

    const datePrefix =
      kind === "removed" ? t.datePrefixRemoved :
      kind === "added"   ? t.datePrefixAdded   : "";

    const rows = items
      .map((it, i) => {
        let dateStr = null;
        if (meta.dateField) {
          dateStr = t.formatItemDate(it[meta.dateField]);
        } else {
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

  const unit = t.itemUnit ? `<span class="unit">${escapeHtml(t.itemUnit)}</span>` : "";
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
  renderTabs(DATA);
  renderMain(DATA);
}

/* ---------- Tweaks ---------- */
function applyDensity(v) { document.documentElement.setAttribute("data-density", v); }

function persistTweaks(partial) {
  Object.assign(tweakState, partial);
  try {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: partial }, "*");
  } catch (e) {}
}

function setLang(v) {
  tweakState.lang = v;
  persistTweaks({ lang: v });
  renderAll();
  const panel = document.getElementById("tweaks");
  if (panel) {
    panel.querySelectorAll('.tw-seg[data-key="lang"] button').forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.v === v))
    );
  }
}

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
      if (key === "dataset") { DATA = applyDataset(RAW, v); renderAll(); }
      if (key === "lang") { tweakState.lang = v; renderAll(); }
      persistTweaks({ [key]: v });
      seg.querySelectorAll("button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.v === v))
      );
    });
  });

  document.getElementById("tw-close").addEventListener("click", () => {
    panel.classList.remove("is-open");
    try { window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*"); } catch (e) {}
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
  try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch (e) {}
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
    RAW = await loadData(fetch, DATA_URL);
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
