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
export const S = { lang: store.get('lang', 'en'), lite: store.get('lite', false), theme: store.get('theme', null) };
export const t = (en, bn) => (S.lang === 'bn' ? bn : en);
const BN = '০১২৩৪৫৬৭৮৯';
export const dig = s => (S.lang === 'bn' ? String(s).replace(/\d/g, d => BN[d]) : String(s));
export const fmt = (n, dec = 0) => dig(Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
export const bdt = n => { n = Number(n); const a = Math.abs(n); if (a >= 1e7) return '৳' + dig((n / 1e7).toFixed(2)) + t(' Cr', ' কোটি'); if (a >= 1e5) return '৳' + dig((n / 1e5).toFixed(2)) + t(' Lakh', ' লাখ'); return '৳' + fmt(n, 0); };
export const esc = s => String(s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
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
export function initShell() {
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
  D.projects.projects.forEach(p => p.materials.forEach(m => m.billed = Math.round(D.baseRates[m.k] * m.factor * 100) / 100)); // billed prices are fixed seed values
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
  const rows = a.rows.map(r => { const m = D.benchmarks.materials[r.k]; return `<tr data-excess="${r.excess.toFixed(2)}" data-level="${r.level}"><td class="b">${esc(nm(m))}</td><td class="n">${fmt(r.qty)} ${esc(m.unit)}</td><td class="n">${fmt(r.billed, 2)}</td><td class="n">${fmt(r.bench, 2)}</td><td class="n">${fmt(r.total)}</td><td>${pill(r.level, lvlText(r))}</td></tr>`; }).join('');
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
export function graphHTML(p, lite = S.lite) {
  const g = graphNodes(p), L = [['Ministry', 'মন্ত্রণালয়', nm(g.ministry)], ['Agency', 'সংস্থা', p.agency], ['Project', 'প্রকল্প', nm(p)], ['Contractor', 'ঠিকাদার', nm(g.c)], ['Suppliers', 'সরবরাহকারী', g.sup.join(', ')], ['Union', 'ইউনিয়ন', nm(g.un)]];
  if (lite) return `<ul>${L.map(x => `<li><b>${esc(t(x[0], x[1]))}:</b> ${esc(x[2])}</li>`).join('')}</ul><p class="sm mute">${t('Diagram hidden in lite mode.', 'লাইট মোডে ডায়াগ্রাম লুকানো।')}</p>`;
  const N = [{ id: 'ministry', x: 60, y: 120, l: 'Ministry' }, { id: 'agency', x: 170, y: 120, l: p.agency }, { id: 'project', x: 290, y: 120, l: 'Project' }, { id: 'contractor', x: 410, y: 120, l: 'Contractor' }, { id: 'union', x: 290, y: 30, l: 'Union' }];
  g.sup.slice(0, 4).forEach((s, i) => N.push({ id: 'sup' + i, x: 530, y: 30 + i * 60, l: s.replace('Demo ', '').split(' ')[0], full: s }));
  const E = [['ministry', 'agency'], ['agency', 'project'], ['project', 'contractor'], ['project', 'union'], ...N.filter(n => n.id.startsWith('sup')).map(n => ['contractor', n.id])];
  const byId = Object.fromEntries(N.map(n => [n.id, n]));
  return `<svg viewBox="0 0 600 210" width="100%" role="group" aria-label="${t('Knowledge graph', 'নলেজ গ্রাফ')}">${E.map(e => `<line x1="${byId[e[0]].x}" y1="${byId[e[0]].y}" x2="${byId[e[1]].x}" y2="${byId[e[1]].y}" stroke="var(--line)" stroke-width="2"/>`).join('')}${N.map(n => `<g class="nd" tabindex="0" role="button" data-node="${n.id}" aria-label="${esc(n.id)}"><circle cx="${n.x}" cy="${n.y}" r="26" fill="${n.id === 'contractor' && g.c.priorDelays >= 3 ? 'var(--crim)' : 'var(--em)'}"/><text x="${n.x}" y="${n.y + 4}" text-anchor="middle" font-size="10" fill="#fff">${esc(n.l.slice(0, 10))}</text></g>`).join('')}</svg>`;
}
export function nodeDetails(p, id) {
  const g = graphNodes(p);
  if (id === 'ministry') return t('Ministry (demo label): ', 'মন্ত্রণালয় (ডেমো লেবেল): ') + nm(g.ministry);
  if (id === 'agency') return t('Implementing agency: ', 'বাস্তবায়নকারী সংস্থা: ') + p.agency;
  if (id === 'project') return nm(p) + ' · ' + p.id;
  if (id === 'union') return t('Union: ', 'ইউনিয়ন: ') + nm(g.un);
  if (id === 'contractor') return nm(g.c) + ' · ' + t('track record (synthetic) ', 'ট্র্যাক রেকর্ড (কৃত্রিম) ') + fmt(g.c.score) + '/100 · ' + t('prior delays ', 'আগের বিলম্ব ') + fmt(g.c.priorDelays) + (g.others.length ? ' · ' + t('other projects in seed data: ', 'সিড ডেটায় অন্য প্রকল্প: ') + g.others.map(o => o.id).join(', ') : '');
  const s = g.sup[+id.slice(3)]; return t('Supplier (fictional): ', 'সরবরাহকারী (কাল্পনিক): ') + s;
}

/* ---------- retrieval copilot (rule-based) ---------- */
const tok = s => s.toLowerCase().split(/[^a-z0-9ঀ-৿]+/).filter(w => w.length > 1);
export function answer(q, p) {
  const f = flags(); if (!f.copilot) return { text: t('Copilot is disabled in the demo admin settings.', 'কোপাইলট ডেমো অ্যাডমিন সেটিংসে বন্ধ আছে।'), cite: [] };
  const qt = new Set(tok(q)); let best = null, bs = 0;
  D.kb.passages.forEach(ps => { const sc = tok(ps.kw).filter(w => qt.has(w)).length; if (sc > bs) { bs = sc; best = ps; } });
  const a = auditProject(p);
  const wantPrice = [...qt].some(w => /^(price|prices|cost|costs|expensive|overpriced|material|materials|rate|rates|benchmark|above|দাম|মূল্য|উপকরণ|বেশি|বেঞ্চমার্কের|উপরে)$/.test(w));
  const wantDelay = [...qt].some(w => /^(delay|late|deadline|progress|behind|বিলম্ব|দেরি|সময়সীমা|অগ্রগতি)$/.test(w));
  if (wantPrice) {
    const fl = a.rows.filter(r => r.level !== 'ok');
    return { text: (fl.length ? t('Items above benchmark in this project:\n', 'এই প্রকল্পে বেঞ্চমার্কের উপরের আইটেম:\n') + fl.map(r => '• ' + nm(D.benchmarks.materials[r.k]) + ': ' + lvlText(r)).join('\n') + '\n' + t('Estimated excess: ', 'আনুমানিক অতিরিক্ত: ') + bdt(a.excess) : t('No item is more than 5% above its benchmark in this project.', 'এই প্রকল্পে কোনো আইটেম বেঞ্চমার্কের ৫% এর বেশি উপরে নয়।')) + '\n' + t('Benchmarks ignore transport and bulk discounts. A person must decide.', 'বেঞ্চমার্কে পরিবহন ও বাল্ক ছাড় নেই। সিদ্ধান্ত মানুষের।'), cite: [t('Seed data: ', 'সিড ডেটা: ') + p.id, 'kb-flags'] };
  }
  if (wantDelay) {
    return { text: t('Progress ', 'অগ্রগতি ') + fmt(a.prog, 1) + '%, ' + t('disbursed ', 'ছাড় ') + fmt(a.disbPct, 1) + '%, ' + t('deadline ', 'সময়সীমা ') + dig(p.deadline) + (a.ds.past ? t(' (past by ' + a.ds.daysPast + ' days).', ' (' + fmt(a.ds.daysPast) + ' দিন পেরিয়েছে)।') : t(' (' + a.ds.days + ' days left).', ' (' + fmt(a.ds.days) + ' দিন বাকি)।')) + (a.red.length ? '\n' + a.red.map(redText).join('; ') : ''), cite: [t('Seed data: ', 'সিড ডেটা: ') + p.id, 'kb-delay'] };
  }
  if (best) return { text: (S.lang === 'bn' ? best.bn : best.en), cite: [best.id] };
  return { text: t('No matching passage in the local knowledge base. Try: prices, delay, projection, procurement, reporting.', 'স্থানীয় নলেজ বেসে মিল পাওয়া যায়নি। চেষ্টা করুন: দাম, বিলম্ব, প্রক্ষেপণ, ক্রয়, অভিযোগ।'), cite: [] };
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
