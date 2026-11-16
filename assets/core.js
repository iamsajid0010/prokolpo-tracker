// Prokolpo Tracker core. Vanilla ES module. No external requests except the optional Open-Meteo call.
export const BASE = new URL('../', import.meta.url);
export const ROUTES = [['app', 'Main App', 'মূল অ্যাপ'], ['demo-user', 'Demo User', 'ডেমো ইউজার'], ['demo-admin', 'Demo Admin', 'ডেমো অ্যাডমিন'], ['admin', 'Admin (demo)', 'অ্যাডমিন (ডেমো)'], ['data', 'Data', 'ডেটা'], ['security', 'Security', 'নিরাপত্তা'], ['architecture', 'Architecture', 'আর্কিটেকচার'], ['presentation', 'Presentation', 'উপস্থাপনা'], ['pitchdeck', 'Pitch Deck', 'পিচ ডেক'], ['audit', 'Audit', 'অডিট'], ['prompt', 'Prompt', 'প্রম্পট'], ['docs', 'Docs', 'ডকস']];

/* ---------- storage (localStorage with try/catch) ---------- */
const mem = {};
export const store = {
  get(k, d) { try { const v = localStorage.getItem('pt:' + k); return v === null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem('pt:' + k, JSON.stringify(v)); } catch (e) { } },
  ok() { try { localStorage.setItem('pt:_t', '1'); localStorage.removeItem('pt:_t'); return true; } catch (e) { return false; } }
};

/* ---------- language, formatting ---------- */
export const S = { lang: store.get('lang', 'en'), lite: store.get('lite', false), theme: store.get('theme', 'dark') };
export const t = (en, bn) => (S.lang === 'bn' ? bn : en);
const BN = '০১২৩৪৫৬৭৮৯';
export const dig = s => (S.lang === 'bn' ? String(s).replace(/\d/g, d => BN[d]) : String(s));
export const fmt = (n, dec = 0) => dig(Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
export const bdt = n => { n = Number(n); const a = Math.abs(n); if (a >= 1e7) return '৳' + dig((n / 1e7).toFixed(2)) + t(' Cr', ' কোটি'); if (a >= 1e5) return '৳' + dig((n / 1e5).toFixed(2)) + t(' Lakh', ' লাখ'); return '৳' + fmt(n, 0); };
export const esc = s => String(s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
const UNIT_BN = { kg: 'কেজি', bag: 'ব্যাগ', pc: 'পিস', cft: 'ঘনফুট', rft: 'রানিং ফুট', cum: 'ঘনমিটার', mm: 'মিমি' };
export const unitT = u => (S.lang === 'bn' ? UNIT_BN[u] || u : u);
export const nm = o => (S.lang === 'bn' ? o.bn || o.en || o.name : o.en || o.name);
const langListeners = [];
export const onLang = f => langListeners.push(f);
export function applyLang() {
  document.documentElement.lang = S.lang;
  document.querySelectorAll('[data-bn]').forEach(el => { if (el.dataset.en === undefined) el.dataset.en = el.textContent; el.textContent = S.lang === 'bn' ? el.dataset.bn : el.dataset.en; });
  document.querySelectorAll('[data-bn-ph]').forEach(el => { if (el.dataset.enPh === undefined) el.dataset.enPh = el.placeholder; el.placeholder = S.lang === 'bn' ? el.dataset.bnPh : el.dataset.enPh; });
  langListeners.forEach(f => f());
}
export function setLang(l) { S.lang = l; store.set('lang', l); syncTop(); applyLang(); }
export function setLite(v) { S.lite = v; store.set('lite', v); document.body.classList.toggle('lite', v); syncTop(); langListeners.forEach(f => f()); }
export function toast(m) { let e = document.getElementById('toast'); if (!e) { e = document.createElement('div'); e.id = 'toast'; e.className = 'toast'; e.setAttribute('role', 'status'); document.body.appendChild(e); } e.textContent = m; e.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => e.hidden = true, 2800); }
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export function delegate(root, ev, sel, fn) { root.addEventListener(ev, e => { const el = e.target.closest(sel); if (el && root.contains(el)) fn(el, e); }); }

/* ---------- shell: toolbar wiring (sidebar and banner are pre-rendered in HTML) ---------- */
function syncTop() {
  $$('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.setLang === S.lang));
  $$('[data-set-lang]').forEach(b => b.classList.toggle('on', b.dataset.setLang === S.lang));
  const l = $('#lite-btn'); if (l) { l.setAttribute('aria-pressed', S.lite); l.textContent = t('Lite mode: ', 'লাইট মোড: ') + (S.lite ? t('on', 'চালু') : t('off', 'বন্ধ')); }
}

function fx() {
  if (!$('.bgfx')) { const b = document.createElement('div'); b.className = 'bgfx'; b.setAttribute('aria-hidden', 'true'); b.innerHTML = '<i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="grid"></i>'; document.body.prepend(b); }
  let seen = false; try { seen = sessionStorage.getItem('pt-splash') === '1'; } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches || S.lite) return;
  try { sessionStorage.setItem('pt-splash', '1'); } catch (e) {}
  const sp = document.createElement('div'); sp.className = 'splash'; sp.setAttribute('role', 'dialog'); sp.setAttribute('aria-label', t('Opening animation', 'শুরুর অ্যানিমেশন'));
  sp.innerHTML = `<div class="sp-in"><svg class="sp-logo" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="4" class="sp-ring"/><path d="M30 80 L50 52 L66 68 L92 34" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" class="sp-line"/><circle cx="92" cy="34" r="7" fill="currentColor" class="sp-dot"/></svg><h1>${t('Prokolpo Tracker', 'প্রকল্প ট্র্যাকার')}</h1><p>${t('Transparent Government · CivicSphere AI', 'স্বচ্ছ সরকার · সিভিকস্ফিয়ার এআই')}</p><div class="sp-bar" aria-hidden="true"><i></i></div><p class="sp-note">${t('Synthetic demo data. Not real government records.', 'কৃত্রিম ডেমো ডেটা। প্রকৃত সরকারি রেকর্ড নয়।')}</p><button class="btn" type="button">${t('Skip', 'এড়িয়ে যান')}</button></div>`;
  document.body.appendChild(sp); const done = () => { sp.classList.add('out'); setTimeout(() => sp.remove(), 450); };
  sp.querySelector('button').addEventListener('click', done); sp.addEventListener('keydown', e => { if (e.key === 'Escape') done(); }); setTimeout(done, 2100); sp.querySelector('button').focus({ preventScroll: true });
}
export function initShell() {
  document.documentElement.classList.add('js'); fx();
  if (S.theme) document.documentElement.dataset.theme = S.theme;
  document.body.classList.toggle('lite', S.lite);
  delegate(document, 'click', '[data-set-lang]', b => setLang(b.dataset.setLang));
  $('#lite-btn')?.addEventListener('click', () => setLite(!S.lite));
  $('#theme-btn')?.addEventListener('click', () => { const d = document.documentElement; const cur = d.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'); const n = cur === 'dark' ? 'light' : 'dark'; d.dataset.theme = n; store.set('theme', n); });
  $('#menu-btn')?.addEventListener('click', () => $('#rail').classList.toggle('open'));
  syncTop(); applyLang();
}

/* ---------- data ---------- */
export const D = {};
export async function loadAll() {
  const names = ['geo', 'projects', 'benchmarks', 'contractors', 'agencies', 'kb'];
  const res = await Promise.all(names.map(n => fetch(new URL('data/' + n + '.json', BASE)).then(r => { if (!r.ok) throw new Error(n + ' ' + r.status); return r.json(); })));
  names.forEach((n, i) => D[n] = res[i]);
  D.baseRates = Object.fromEntries(Object.entries(D.benchmarks.materials).map(([k, v]) => [k, v.rate]));
  const iso = o => { const d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  D.iso = iso; // seed dates are stored as day offsets from today and resolved here with new Date(); the series always ends yesterday
  D.projects.projects.forEach(p => {
    p.start = iso(p.startO); p.deadline = iso(p.deadlineO);
    p.daily.forEach(d => d.d = iso(d.o)); p.logs.forEach(l => l.d = iso(l.o));
    p.materials.forEach(m => m.billed = Math.round(D.baseRates[m.k] * m.factor * 100) / 100); // billed prices are fixed seed values
  });
  return D;
}
export const allProjects = () => D.projects.projects;
export const rateOverrides = () => store.get('rates', {});
export const rates = () => ({ ...D.baseRates, ...rateOverrides() });
export function setRate(k, v) { const o = rateOverrides(); o[k] = v; store.set('rates', o); }
export function resetRates() { store.set('rates', {}); }
export const flags = () => store.get('flags', { projection: true, copilot: true });
export const progressOf = p => p.daily[p.daily.length - 1].p;
export const unionProjects = id => allProjects().filter(p => p.union === id);
export function findUnion(id) { for (const d of D.geo.divisions) for (const s of d.districts) for (const u of s.upazilas) for (const n of u.unions) if (n.id === id) return { d, s, u, n }; return null; }

/* ---------- rules engine ---------- */
export function deadlineStatus(p, now = new Date()) {
  const dl = new Date(p.deadline + 'T23:59:59'); const days = Math.ceil((dl - now) / 864e5);
  return { past: now > dl, days, daysPast: Math.max(0, -days) };
}
export function auditProject(p, rt = rates(), now = new Date()) {
  const rows = p.materials.map(m => {
    const bench = rt[m.k]; const pct = (m.billed - bench) / bench * 100;
    const level = pct > 15 ? 'bad' : pct > 5 ? 'warn' : 'ok';
    return { k: m.k, qty: m.qty, billed: m.billed, bench, pct, level, total: m.qty * m.billed, excess: level === 'ok' ? 0 : (m.billed - bench) * m.qty };
  });
  const excess = rows.reduce((s, r) => s + r.excess, 0);
  const disbPct = Math.min(100, p.disbursed / p.budget * 100), prog = progressOf(p), ds = deadlineStatus(p, now);
  const red = [];
  if (disbPct - prog > 15) red.push('gap');
  if (ds.past && disbPct > 70 && prog < 100) red.push('pastdisb');
  const c = D.contractors[p.contractor];
  const repeat = c.priorDelays >= 3 || (c.priorDelays >= 2 && ds.past);
  return { rows, excess, disbPct, prog, ds, red, repeat, flagged: rows.filter(r => r.level !== 'ok').length };
}
export const redText = k => k === 'gap' ? t('Disbursement ahead of progress', 'অগ্রগতির চেয়ে ছাড় বেশি') : t('Past deadline with disbursement over 70%', 'সময়সীমা পেরিয়ে ৭০% এর বেশি ছাড়');
export const lvlText = r => r.level === 'ok' ? t('Within 5% of benchmark', 'বেঞ্চমার্কের ৫% এর মধ্যে') : r.level === 'warn' ? t('Above benchmark', 'বেঞ্চমার্কের উপরে') + ' +' + fmt(r.pct, 1) + '%' : t('Review recommended', 'পর্যালোচনা সুপারিশকৃত') + ' +' + fmt(r.pct, 1) + '%';

/* ---------- statistical projection (least squares) + Open-Meteo ---------- */
export function regress(daily) {
  const n = daily.length, xs = daily.map((_, i) => i), ys = daily.map(d => d.p);
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
  const slope = sxy / sxx, icpt = my - slope * mx;
  const ssr = ys.reduce((s, y, i) => s + (y - (icpt + slope * xs[i])) ** 2, 0), sst = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  return { n, slope, icpt, r2: sst ? 1 - ssr / sst : 1, nextX: n };
}
const OUTDOOR = new Set(['road', 'bridge', 'drain', 'embankment', 'solar']);
export const RAIN_MM = 10, RAIN_FACTOR = 0.5;
export function project(p, weather) {
  const r = regress(p.daily), last = progressOf(p);
  let slope = r.slope, note = 'none';
  if (weather && weather.ok && OUTDOOR.has(p.kind) && weather.mm >= RAIN_MM) { slope = r.slope * RAIN_FACTOR; note = 'rain'; }
  else if (weather && weather.ok) note = 'clear'; else note = 'offline';
  const tomorrow = last + slope; // tomorrow = latest recorded progress + fitted daily gain (slope), slope scaled if heavy rain is forecast
  const val = Math.min(100, Math.max(last, tomorrow));
  return { ...r, slopeUsed: slope, tomorrow: val, gain: val - last, note, last };
}
let wcache = null;
export async function getWeather() {
  if (wcache) return wcache;
  try {
    const c = new AbortController(); const h = setTimeout(() => c.abort(), 5000);
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.8&longitude=90.4&daily=precipitation_sum&timezone=Asia%2FDhaka&forecast_days=2', { signal: c.signal }); clearTimeout(h);
    const j = await r.json(); wcache = { ok: true, mm: j.daily.precipitation_sum[1], date: j.daily.time[1] };
  } catch (e) { wcache = { ok: false }; }
  return wcache;
}
export const weatherNote = w => w && w.ok ? t('Open-Meteo forecast for Dhaka, ' + w.date + ': ' + w.mm + ' mm rain.', 'ঢাকার জন্য ওপেন-মেটিও পূর্বাভাস, ' + dig(w.date) + ': ' + dig(w.mm) + ' মিমি বৃষ্টি।') : t('Offline: weather not applied.', 'অফলাইন: আবহাওয়া প্রয়োগ হয়নি।');

/* ---------- shared HTML renderers ---------- */
export const pill = (c, x) => `<span class="pill ${c}">${esc(x)}</span>`;
export function priceTableHTML(p, a = auditProject(p)) {
  const rows = a.rows.map(r => { const m = D.benchmarks.materials[r.k]; return `<tr data-excess="${r.excess.toFixed(2)}" data-level="${r.level}"><td class="b">${esc(nm(m))}</td><td class="n">${fmt(r.qty)} ${esc(unitT(m.unit))}</td><td class="n">${fmt(r.billed, 2)}</td><td class="n">${fmt(r.bench, 2)}</td><td class="n">${fmt(r.total)}</td><td>${pill(r.level, lvlText(r))}</td></tr>`; }).join('');
  return `<p><span class="pill ${a.excess > 0 ? 'warn' : 'ok'}" data-banner="${a.excess.toFixed(2)}">${a.excess > 0 ? t('Estimated excess over benchmark (items above 5% only): ', 'বেঞ্চমার্কের চেয়ে আনুমানিক অতিরিক্ত (শুধু ৫% এর উপরের আইটেম): ') + bdt(a.excess) : t('No items above 5% of benchmark', '৫% এর উপরে কোনো আইটেম নেই')}</span> <span class="sm mute">${esc(t(D.benchmarks.disclaimer_en, D.benchmarks.disclaimer_bn))}</span></p>
  <div class="tw"><table><thead><tr><th>${t('Material', 'উপকরণ')}</th><th class="n">${t('Quantity', 'পরিমাণ')}</th><th class="n">${t('Billed ৳/unit', 'বিলকৃত ৳/একক')}</th><th class="n">${t('Benchmark ৳/unit', 'বেঞ্চমার্ক ৳/একক')}</th><th class="n">${t('Total ৳', 'মোট ৳')}</th><th>${t('Status (advisory)', 'অবস্থা (পরামর্শমূলক)')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
export const flagPills = a => a.red.map(k => pill('bad', '⚑ ' + redText(k))).join(' ') + (a.repeat ? ' ' + pill('warn', t('Repeat-delay pattern: review recommended', 'পুনরাবৃত্ত বিলম্ব: পর্যালোচনা সুপারিশকৃত')) : '');

/* ---------- knowledge graph (inline SVG; none in lite mode) ---------- */
export function graphNodes(p) {
  const ag = D.agencies[p.agency], c = D.contractors[p.contractor], un = findUnion(p.union).n;
  const sup = [...new Set(p.materials.map(m => D.benchmarks.materials[m.k].supplier))];
  const others = allProjects().filter(q => q.contractor === p.contractor && q.id !== p.id);
  return { ag, c, un, sup, others, ministry: { en: ag.ministry_en, bn: ag.ministry_bn } };
}
export const agFull = k => { const a = D.agencies[k]; return t(a.full_en, a.full_bn); };
export const agTxt = k => k + (S.lang === 'bn' ? ' (' + D.agencies[k].full_bn + ')' : '');
export const agHTML = k => `<abbr title="${esc(t(D.agencies[k].full_en, D.agencies[k].full_bn))}">${esc(k)}</abbr>`;
export const supName = s => { for (const m of Object.values(D.benchmarks.materials)) if (m.supplier === s) return nm({ en: s, bn: m.supplier_bn }); return s; };
export function graphHTML(p, lite = S.lite) {
  const g = graphNodes(p), L = [['Ministry', 'মন্ত্রণালয়', nm(g.ministry)], ['Agency', 'সংস্থা', agTxt(p.agency)], ['Project', 'প্রকল্প', nm(p)], ['Contractor', 'ঠিকাদার', nm(g.c)], ['Suppliers', 'সরবরাহকারী', g.sup.map(supName).join(', ')], ['Union', 'ইউনিয়ন', nm(g.un)]];
  if (lite) return `<ul>${L.map(x => `<li><b>${esc(t(x[0], x[1]))}:</b> ${esc(x[2])}</li>`).join('')}</ul><p class="sm mute">${t('Diagram hidden in lite mode.', 'লাইট মোডে ডায়াগ্রাম লুকানো।')}</p>`;
  // Large layout: 5 columns (Ministry > Agency > Project > Contractor > Suppliers), Union above Project. Labels sit in boxes below/next to nodes, 15 user units ≈ 12px+ at card width.
  const sup = g.sup.slice(0, 4), wide = !(window.matchMedia && matchMedia('(max-width:760px)').matches);
  const PITCH = wide ? 130 : 150, W = wide ? 1040 : 380, H = wide ? Math.max(340, 50 + (sup.length - 1) * PITCH + 140) : 560 + (sup.length - 1) * PITCH, cy = wide ? H / 2 : 0;
  const pos = wide ? { ministry: [90, cy], agency: [290, cy], project: [490, cy], contractor: [690, cy], union: [490, 50] } : { ministry: [95, 50], agency: [95, 200], project: [95, 350], contractor: [95, 500], union: [285, 350] };
  const N = [
    { id: 'ministry', k: t('Ministry', 'মন্ত্রণালয়'), l: nm(g.ministry).replace(/\s*\((demo label|ডেমো লেবেল)\)/, '') },
    { id: 'agency', k: t('Agency', 'সংস্থা'), l: S.lang === 'bn' ? D.agencies[p.agency].full_bn : p.agency },
    { id: 'project', k: t('Project', 'প্রকল্প'), l: nm(p) },
    { id: 'contractor', k: t('Contractor', 'ঠিকাদার'), l: nm(g.c) },
    { id: 'union', k: t('Union', 'ইউনিয়ন'), l: nm(g.un) }].map(n => ({ ...n, x: pos[n.id][0], y: pos[n.id][1] }));
  sup.forEach((s, i) => N.push({ id: 'sup' + i, x: wide ? 900 : 285, y: wide ? 50 + i * PITCH : 500 + i * PITCH, k: t('Supplier', 'সরবরাহকারী'), l: supName(s) }));
  const E = [['ministry', 'agency'], ['agency', 'project'], ['project', 'contractor'], ['project', 'union'], ...sup.map((_, i) => ['contractor', 'sup' + i])];
  const by = Object.fromEntries(N.map(n => [n.id, n])), wrap = (s, n) => { const w = String(s).split(' '), out = []; let c = ''; w.forEach(x => { if ((c + ' ' + x).trim().length > n) { out.push(c); c = x; } else c = (c + ' ' + x).trim(); }); out.push(c); return out.slice(0, 3); };
  const col = n => n.id === 'contractor' && g.c.priorDelays >= 3 ? 'var(--crim)' : n.id.startsWith('sup') ? 'var(--info, #2f6fa8)' : 'var(--em)';
  return `<svg class="kg" viewBox="0 0 ${W} ${H}" width="100%" role="group" aria-label="${t('Knowledge graph: Ministry, Agency, Project, Contractor, Suppliers, Union', 'নলেজ গ্রাফ: মন্ত্রণালয়, সংস্থা, প্রকল্প, ঠিকাদার, সরবরাহকারী, ইউনিয়ন')}">${E.map(e => `<line x1="${by[e[0]].x}" y1="${by[e[0]].y}" x2="${by[e[1]].x}" y2="${by[e[1]].y}" stroke="var(--mute)" stroke-width="3"/>`).join('')}${N.map(n => { const lines = wrap(n.l, wide ? 18 : 13); return `<g class="nd" tabindex="0" role="button" data-node="${n.id}" aria-label="${esc(n.k + ': ' + n.l)}"><rect x="${n.x - 70}" y="${n.y - 36}" width="140" height="${72 + 18 * lines.length + 18}" fill="transparent"/><circle cx="${n.x}" cy="${n.y}" r="30" fill="${col(n)}" stroke="var(--bg)" stroke-width="3"/><text x="${n.x}" y="${n.y + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" aria-hidden="true">${esc(n.k.slice(0, 1))}</text><text x="${n.x}" y="${n.y + 52}" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)" class="kt">${esc(n.k)}</text>${lines.map((ln, i) => `<text x="${n.x}" y="${n.y + 72 + i * 18}" text-anchor="middle" font-size="15" fill="var(--ink)" class="kt">${esc(ln)}</text>`).join('')}</g>`; }).join('')}</svg>`;
}
export function nodeDetails(p, id) {
  const g = graphNodes(p);
  if (id === 'ministry') return t('Ministry (demo label): ', 'মন্ত্রণালয় (ডেমো লেবেল): ') + nm(g.ministry);
  if (id === 'agency') return t('Implementing agency: ', 'বাস্তবায়নকারী সংস্থা: ') + p.agency + ' — ' + agFull(p.agency);
  if (id === 'project') return nm(p) + ' · ' + p.id;
  if (id === 'union') return t('Union: ', 'ইউনিয়ন: ') + nm(g.un);
  if (id === 'contractor') return nm(g.c) + ' · ' + t('track record (synthetic) ', 'ট্র্যাক রেকর্ড (কৃত্রিম) ') + fmt(g.c.score) + '/' + dig(100) + ' · ' + t('prior delays ', 'আগের বিলম্ব ') + fmt(g.c.priorDelays) + (g.others.length ? ' · ' + t('other projects in seed data: ', 'সিড ডেটায় অন্য প্রকল্প: ') + g.others.map(o => o.id).join(', ') : '');
  const s = g.sup[+id.slice(3)]; return t('Supplier (fictional): ', 'সরবরাহকারী (কাল্পনিক): ') + supName(s);
}

/* ---------- retrieval copilot (rule-based, transparent) ---------- */
export const CHIPS = [['Which materials are above benchmark?', 'কোন উপকরণ বেঞ্চমার্কের উপরে?'], ['Is this project delayed?', 'প্রকল্পটি কি বিলম্বিত?'], ['What is the penalty for late work?', 'দেরিতে কাজ শেষ করলে জরিমানা কী?'], ["How is tomorrow's progress projected?", 'আগামীকালের অগ্রগতি কীভাবে প্রক্ষেপণ করা হয়?']];
export const VARIANTS = ['is it delayed', 'why late', 'overpriced?', 'expensive materials', 'দাম বেশি কেন', 'প্রকল্প কি দেরি', 'how to report a problem'];
// Normalise: NFC, lowercase, strip punctuation (keeps letters, Bangla vowel signs, digits). Tokens match intents by STEM/PREFIX (>= 4 chars; Bangla stems >= 3 code points; a few short exact words).
export const norm = q => String(q).normalize('NFC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]+/gu, '').split(/\s+/).filter(Boolean);
const INTENTS = [
  ['proc', { pre: ['procur', 'tender', 'penalt', 'rules', 'legal', 'regulat', 'sanction', 'জরিমানা', 'দরপত্র', 'বিধি', 'আইন', 'শাস্তি', 'ক্রয়', 'ই-জিপি', 'ইজিপি'], exact: ['law', 'laws', 'rule', 'fine', 'fines', 'ppr', 'egp'] }],
  ['report', { pre: ['report', 'complain', 'whistle', 'grievanc', 'রিপোর্ট', 'অভিযোগ', 'জানাব', 'জানান'], exact: [] }],
  ['proj', { pre: ['projection', 'projected', 'projecting', 'forecast', 'predict', 'tomorrow', 'regress', 'প্রক্ষেপণ', 'পূর্বাভাস', 'আগামী'], exact: [] }],
  ['price', { pre: ['price', 'pricing', 'priced', 'overpri', 'expens', 'costl', 'cost', 'rate', 'benchm', 'material', 'above', 'dearer', 'দাম', 'মূল্য', 'উপকরণ', 'বেঞ্চমার্ক', 'খরচ'], exact: [] }],
  ['delay', { pre: ['delay', 'late', 'behind', 'deadline', 'overdue', 'progress', 'schedul', 'disburs', 'slow', 'দেরি', 'দেরী', 'বিলম্ব', 'সময়সীমা', 'অগ্রগতি', 'পিছিয়', 'ছাড়'], exact: [] }]
];
const hit = (tok, d) => d.exact.includes(tok) || d.pre.some(p => tok.startsWith(p) || (tok.length >= 4 && p.startsWith(tok) && tok.length >= p.length - 1));
export function intentOf(q) { const toks = norm(q); for (const [id, d] of INTENTS) if (toks.some(x => hit(x, d))) return id; return null; }
const kbp = id => D.kb.passages.find(x => x.id === id);
const ILLUS = () => t('Illustrative, verify with official source.', 'উদাহরণমূলক, সরকারি সূত্রে যাচাই করুন।');
export function answer(q, p, opts = {}) {
  if (!opts.force && !flags().copilot) return { text: t('Copilot is disabled in the admin demo settings.', 'কোপাইলট অ্যাডমিন ডেমো সেটিংসে বন্ধ আছে।'), cite: [], intent: 'disabled' };
  const intent = intentOf(q), a = auditProject(p), seed = t('Seed data: ', 'সিড ডেটা: ') + p.id, pas = id => (S.lang === 'bn' ? kbp(id).bn : kbp(id).en);
  if (intent === 'proc') return { intent, text: pas('kb-proc'), cite: ['kb-proc'] };
  if (intent === 'report') return { intent, text: pas('kb-report'), cite: ['kb-report'] };
  if (intent === 'proj') {
    if (!flags().projection && !opts.force) return { intent, text: pas('kb-proj') + '\n' + t('The projection feature is switched off in the admin demo.', 'প্রক্ষেপণ ফিচার অ্যাডমিন ডেমোতে বন্ধ।'), cite: ['kb-proj'] };
    const pr = project(p, wcache); return { intent, text: pas('kb-proj') + '\n' + t('For this project: ', 'এই প্রকল্পের জন্য: ') + fmt(pr.last, 1) + '% → ' + fmt(pr.tomorrow, 1) + '% (' + t('slope ', 'ঢাল ') + fmt(pr.slope, 3) + ', R² ' + fmt(pr.r2, 3) + ').', cite: ['kb-proj', seed] };
  }
  if (intent === 'price') {
    const fl = a.rows.filter(r => r.level !== 'ok');
    return { intent, text: (fl.length ? t('Items above benchmark in this project:\n', 'এই প্রকল্পে বেঞ্চমার্কের উপরের আইটেম:\n') + fl.map(r => '• ' + nm(D.benchmarks.materials[r.k]) + ': ' + lvlText(r)).join('\n') + '\n' + t('Estimated excess (items above 5% only): ', 'আনুমানিক অতিরিক্ত (শুধু ৫% এর উপরের আইটেম): ') + bdt(a.excess) : t('No item is more than 5% above its benchmark in this project.', 'এই প্রকল্পে কোনো আইটেম বেঞ্চমার্কের ৫% এর বেশি উপরে নয়।')) + '\n' + t('Benchmarks ignore transport and bulk discounts, so this is advisory; a person decides. ', 'বেঞ্চমার্কে পরিবহন ও বাল্ক ছাড় ধরা হয়নি, তাই এটি পরামর্শমূলক; সিদ্ধান্ত মানুষের। ') + ILLUS(), cite: [seed, 'kb-rates', 'kb-flags'] };
  }
  if (intent === 'delay') {
    return { intent, text: t('Progress ', 'অগ্রগতি ') + fmt(a.prog, 1) + '%, ' + t('disbursed ', 'ছাড় ') + fmt(a.disbPct, 1) + '%, ' + t('deadline ', 'সময়সীমা ') + dig(p.deadline) + (a.ds.past ? t(' (past by ' + a.ds.daysPast + ' days).', ' (' + fmt(a.ds.daysPast) + ' দিন পেরিয়েছে)।') : t(' (' + a.ds.days + ' days left).', ' (' + fmt(a.ds.days) + ' দিন বাকি)।')) + (a.red.length ? '\n' + a.red.map(redText).join('; ') : '') + '\n' + t('Advisory only; review recommended where flagged.', 'শুধু পরামর্শমূলক; ফ্ল্যাগ থাকলে পর্যালোচনা সুপারিশকৃত।'), cite: [seed, 'kb-delay'] };
  }
  // 6. best-scoring passage by stem overlap
  const qt = norm(q); let best = null, bs = 0;
  D.kb.passages.forEach(ps => { const sc = norm(ps.kw).filter(w => w.length >= 4 && qt.some(x => x.length >= 4 && (x.startsWith(w) || w.startsWith(x)))).length; if (sc > bs) { bs = sc; best = ps; } });
  if (best) return { intent: 'best', text: S.lang === 'bn' ? best.bn : best.en, cite: [best.id] };
  return { intent: 'fallback', fallback: true, text: t('I could not match that to a passage in the local knowledge base. Try one of these questions:', 'স্থানীয় নলেজ বেসে এর সাথে মিল পাইনি। এই প্রশ্নগুলোর একটি চেষ্টা করুন:'), cite: [], examples: CHIPS.map(c => t(c[0], c[1])) };
}

/* ---------- voice (Web Speech API) ---------- */
export function voice(cb) {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) { toast(t('Voice input is not supported in this browser. Type your question.', 'এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। প্রশ্ন লিখুন।')); return false; }
  const r = new R(); r.lang = S.lang === 'bn' ? 'bn-BD' : 'en-US'; r.interimResults = false;
  r.onresult = e => cb(e.results[0][0].transcript); r.onerror = e => toast(t('Voice error: ', 'ভয়েস ত্রুটি: ') + e.error); r.onstart = () => toast(t('Listening…', 'শুনছি…'));
  try { r.start(); } catch (e) { toast(t('Could not start voice input.', 'ভয়েস ইনপুট চালু করা যায়নি।')); return false; } return true;
}
export const tagHTML = s => `<span class="tag ${s}">${s === 'implemented' ? t('Implemented', 'বাস্তবায়িত') : t('Planned', 'পরিকল্পিত')}</span>`;
export const download = (name, text, type = 'application/json') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
export const copy = async txt => { try { await navigator.clipboard.writeText(txt); toast(t('Copied', 'কপি হয়েছে')); } catch (e) { toast(t('Copy blocked. Select the text manually.', 'কপি আটকেছে। হাতে নির্বাচন করুন।')); } };
