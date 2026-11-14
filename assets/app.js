import * as C from './core.js';
import { mapHTML, mapListHTML } from './map.js';
const { t, esc, fmt, bdt, nm, dig, pill, $, $$, store, D } = C;
const sel = store.get('sel', { d: 'dhaka', s: 'dhaka', u: 'savar', n: 'ashulia' });
let pi = 0, tab = 'overview', role = store.get('role', 'citizen'), W = null, chat = [], nodeId = null;
const QUICK = [['dhaka', 'dhaka', 'savar', 'ashulia'], ['dhaka', 'dhaka', 'savar', 'birulia'], ['chattogram', 'chattogram', 'sitakunda', 'barabkunda'], ['sylhet', 'sylhet', 'jaintiapur', 'charikatha']];
const find = (arr, id) => arr.find(x => x.id === id) || arr[0];
function fixSel() { const d = find(D.geo.divisions, sel.d); sel.d = d.id; const s = find(d.districts, sel.s); sel.s = s.id; const u = find(s.upazilas, sel.u); sel.u = u.id; const n = find(u.unions, sel.n); sel.n = n.id; return { d, s, u, n }; }
const opt = (arr, v) => arr.map(x => `<option value="${esc(x.id)}"${x.id === v ? ' selected' : ''}>${esc(nm(x))}${x.hasData === true ? ' ★' : ''}</option>`).join('');
const selectors = G => `<div class="card"><div class="grid g4">
 <label class="f">${t('Division', 'বিভাগ')}<select data-lv="d" id="sel-d">${opt(D.geo.divisions, sel.d)}</select></label>
 <label class="f">${t('District', 'জেলা')}<select data-lv="s" id="sel-s">${opt(G.d.districts, sel.s)}</select></label>
 <label class="f">${t('Upazila', 'উপজেলা')}<select data-lv="u" id="sel-u">${opt(G.s.upazilas, sel.u)}</select></label>
 <label class="f">${t('Union', 'ইউনিয়ন')} (★ ${t('has data', 'ডেটা আছে')})<select data-lv="n" id="sel-n">${opt(G.u.unions, sel.n)}</select></label></div>
 <div class="row" style="margin-top:10px"><span class="b sm">${t('Quick jump', 'দ্রুত যান')}:</span>${QUICK.map(q => `<button class="btn ${q[3] === sel.n ? 'on' : ''}" data-q="${q.join('/')}" title="${t('Jump to this union with sample data', 'নমুনা ডেটাসহ এই ইউনিয়নে যান')}">${esc(nm(C.findUnion(q[3]).n))}</button>`).join('')}</div>
 <p class="sm mute">${esc(t(D.geo.note_en, D.geo.note_bn))}</p></div>`;
const roleBar = () => `<div class="row" role="group" aria-label="${t('View mode', 'ভিউ মোড')}"><span class="b sm">${t('View as', 'দেখুন')}:</span>${[['citizen', 'Citizen', 'নাগরিক'], ['journalist', 'Journalist', 'সাংবাদিক'], ['overseer', 'Union Overseer', 'ইউনিয়ন তদারক']].map(r => `<button class="btn ${role === r[0] ? 'on' : ''}" data-role="${r[0]}" aria-pressed="${role === r[0]}">${t(r[1], r[2])}</button>`).join('')}<span class="sm mute">${t('UI mode only. No special access.', 'শুধু ইন্টারফেস মোড। বিশেষ অ্যাক্সেস নয়।')}</span></div>`;
const onboard = () => store.get('onb', false) ? '' : `<div class="card" style="border-color:var(--em)"><div class="row" style="justify-content:space-between"><h2>${t('Start here: 2-minute walkthrough', 'এখানে শুরু: ২ মিনিটের ওয়াকথ্রু')}</h2><button class="btn" data-act="onb">${t('Dismiss', 'বন্ধ করুন')}</button></div><ol><li>${t('Ashulia Union is already selected with sample data.', 'আশুলিয়া ইউনিয়ন নমুনা ডেটাসহ নির্বাচিত।')}</li><li>${t('Open a project card, then the Price audit tab.', 'একটি প্রকল্প কার্ড খুলে মূল্য নিরীক্ষা ট্যাব দেখুন।')}</li><li>${t('Read the projection formula in Overview.', 'ওভারভিউতে প্রক্ষেপণের সূত্র পড়ুন।')}</li><li>${t('Ask the copilot: “Which materials are above benchmark?”', 'কোপাইলটকে জিজ্ঞাসা করুন: “কোন উপকরণ বেঞ্চমার্কের উপরে?”')}</li></ol></div>`;


let mapOn = false;
function findUnion(id) { for (const d of D.geo.divisions) for (const s of d.districts) for (const u of s.upazilas) for (const n of u.unions) if (n.id === id) return { n, u, s, d }; return null; }
function gmapCard(p) {
  const f = findUnion(p.union); if (!f || f.n.lat == null) return '';
  const q = f.n.lat + ',' + f.n.lng, link = 'https://www.google.com/maps?q=' + q, name = nm(f.n) + ', ' + nm(f.u) + ', ' + nm(f.s);
  const body = mapOn && !C.S.lite ? `<iframe title="${esc(t('Google Map of ', 'গুগল ম্যাপ: ') + name)}" src="https://www.google.com/maps?q=${q}&z=13&output=embed" loading="lazy" referrerpolicy="no-referrer" allowfullscreen></iframe>` : `<div class="mapph"><p><b>${esc(name)}</b><br><span class="sm mute">${t('Approximate location', 'আনুমানিক অবস্থান')}: ${fmt(f.n.lat, 4)}, ${fmt(f.n.lng, 4)}</span></p>${C.S.lite ? '' : `<button class="btn pri" type="button" data-loadmap>${t('Load interactive Google Map', 'ইন্টারঅ্যাক্টিভ গুগল ম্যাপ লোড করুন')}</button> `}<a class="btn" href="${link}" target="_blank" rel="noopener noreferrer">${t('Open in Google Maps', 'গুগল ম্যাপে খুলুন')}</a></div>`;
  return `<div class="card" style="margin-top:12px"><h3>${t('Locate on map', 'মানচিত্রে অবস্থান')} <span class="tag implemented">${t('Implemented', 'বাস্তবায়িত')}</span></h3><div class="mapbox">${body}</div><p class="sm mute">${t('Third-party content: the map loads from Google only after you click, and Google may receive your IP address. Nothing else on this site contacts Google. ' + D.geo.coord_note_en, 'তৃতীয় পক্ষের কনটেন্ট: আপনি ক্লিক করলেই গুগল থেকে মানচিত্র লোড হয়, গুগল আপনার আইপি ঠিকানা পেতে পারে। এই সাইটের আর কিছু গুগলের সাথে যোগাযোগ করে না। ' + D.geo.coord_note_bn)}</p></div>`;
}
function card(p, i) {
  const a = C.auditProject(p);
  return `<button class="card" data-pi="${i}" style="text-align:left;width:100%;${i === pi ? 'border-color:var(--em);border-width:2px' : ''}" aria-pressed="${i === pi}">${C.S.lite ? '' : `<img class="pimg" src="../assets/img/${esc(p.kind)}.svg" alt="" width="400" height="225" loading="lazy">`}<div class="row"><span class="pill">${C.agHTML(p.agency)}</span>${a.ds.past && a.prog < 100 ? pill('bad', t('Past deadline', 'সময়সীমা পেরিয়েছে')) : ''}${a.flagged ? pill(a.rows.some(r => r.level === 'bad') ? 'bad' : 'warn', fmt(a.flagged) + ' ' + t('price flags', 'মূল্য ফ্ল্যাগ')) : pill('ok', t('Prices within 5%', 'মূল্য ৫% এর মধ্যে'))}${a.red.length ? pill('bad', '⚑ ' + fmt(a.red.length)) : ''}</div><h3 style="margin-top:6px">${esc(nm(p))}</h3><div class="bar" role="progressbar" aria-valuenow="${a.prog}" aria-valuemin="0" aria-valuemax="100"><i style="width:${a.prog}%"></i></div><div class="sm">${fmt(a.prog, 1)}% · ${bdt(p.budget)}</div></button>`;
}
function chartHTML(p, pr) {
  if (C.S.lite) return `<div class="tw"><table><thead><tr><th>${t('Date', 'তারিখ')}</th><th class="n">${t('Progress %', 'অগ্রগতি %')}</th></tr></thead><tbody>${p.daily.map(d => `<tr><td>${dig(d.d)}</td><td class="n">${fmt(d.p, 2)}</td></tr>`).join('')}</tbody></table></div>`;
  const n = p.daily.length, lo = Math.floor(Math.min(...p.daily.map(d => d.p)) - 2), hi = Math.ceil(pr.tomorrow + 2), X = i => 50 + i * 38, Y = v => 150 - (v - lo) / (hi - lo) * 125;
  return `<svg viewBox="0 0 620 180" width="100%" role="img" aria-label="${t('Daily progress with projection', 'দৈনিক অগ্রগতি ও প্রক্ষেপণ')}"><line x1="50" x2="600" y1="150" y2="150" stroke="var(--line)"/><text x="46" y="${Y(lo) + 4}" text-anchor="end" font-size="10" fill="var(--mute)">${lo}%</text><text x="46" y="${Y(hi) + 4}" text-anchor="end" font-size="10" fill="var(--mute)">${hi}%</text><polyline fill="none" stroke="var(--em)" stroke-width="2.5" points="${p.daily.map((d, i) => X(i) + ',' + Y(d.p)).join(' ')}"/><line x1="${X(0)}" y1="${Y(pr.icpt)}" x2="${X(n - 1)}" y2="${Y(pr.icpt + pr.slope * (n - 1))}" stroke="var(--blue)" stroke-dasharray="4 3"/><line x1="${X(n - 1)}" y1="${Y(pr.last)}" x2="${X(n)}" y2="${Y(pr.tomorrow)}" stroke="var(--amber)" stroke-width="2.5"/><circle cx="${X(n)}" cy="${Y(pr.tomorrow)}" r="4" fill="var(--amber)"/><text x="50" y="172" font-size="10" fill="var(--mute)">${dig(p.daily[0].d.slice(5))}</text><text x="${X(n - 1)}" y="172" text-anchor="middle" font-size="10" fill="var(--mute)">${dig(p.daily[n - 1].d.slice(5))}</text><text x="${X(n)}" y="${Y(pr.tomorrow) - 8}" text-anchor="end" font-size="10" fill="var(--amber)">${t('projected', 'প্রক্ষেপিত')}</text></svg>`;
}
function overview(p, a) {
  const f = C.flags(); let proj = `<p class="mute">${t('Projection is disabled in demo admin settings.', 'প্রক্ষেপণ ডেমো অ্যাডমিন সেটিংসে বন্ধ।')}</p>`;
  if (f.projection) {
    const pr = C.project(p, W);
    proj = `<div class="card" style="background:var(--emsoft)"><div class="row"><h3>${t('Next-day statistical projection', 'পরবর্তী দিনের পরিসংখ্যানিক প্রক্ষেপণ')}</h3><span class="tag implemented">${t('Implemented', 'বাস্তবায়িত')}</span></div>
    <div class="big">${fmt(pr.last, 1)}% → ${fmt(pr.tomorrow, 1)}% <span class="sm mute">(+${fmt(pr.gain, 2)})</span></div>
    <table><tbody><tr><td>${t('Method', 'পদ্ধতি')}</td><td>${t('Least-squares line over ' + pr.n + ' daily records', dig(pr.n) + 'টি দৈনিক রেকর্ডে লিস্ট-স্কয়ার্স রেখা')}</td></tr>
    <tr><td>${t('Fitted slope (per day)', 'ফিটেড ঢাল (প্রতিদিন)')}</td><td class="n">${fmt(pr.slope, 3)} ${t('pts', 'পয়েন্ট')}</td></tr><tr><td>R²</td><td class="n">${fmt(pr.r2, 3)}</td></tr>
    <tr><td>${t('Weather adjustment', 'আবহাওয়া সমন্বয়')}</td><td>${esc(C.weatherNote(W))} ${pr.note === 'rain' ? t('Slope × ' + C.RAIN_FACTOR + ' (assumption: outdoor work, rain ≥ ' + C.RAIN_MM + ' mm).', 'ঢাল × ' + dig(C.RAIN_FACTOR) + ' (অনুমান: বাইরের কাজ, বৃষ্টি ≥ ' + dig(C.RAIN_MM) + ' মিমি)।') : ''}</td></tr></tbody></table>
    <p class="sm"><b>${t('Formula', 'সূত্র')}:</b> ${t('tomorrow = latest progress + slope', 'আগামীকাল = সর্বশেষ অগ্রগতি + ঢাল')} = ${fmt(pr.last, 2)} + ${fmt(pr.slopeUsed, 3)} = ${fmt(pr.tomorrow, 2)}. ${t('Estimate only, not a promise.', 'শুধু অনুমান, প্রতিশ্রুতি নয়।')}</p></div>${chartHTML(p, pr)}`;
  }
  const C1 = D.contractors[p.contractor];
  return `<div class="grid g4"><div><div class="sm mute">${t('Budget', 'বাজেট')}</div><div class="big">${bdt(p.budget)}</div></div><div><div class="sm mute">${t('Disbursed', 'ছাড়কৃত')}</div><div class="big">${bdt(Math.min(p.disbursed, p.budget))}</div><div class="sm">${fmt(a.disbPct, 1)}% ${t('of budget', 'বাজেটের')}</div></div>
  <div><div class="sm mute">${t('Contractor (fictional)', 'ঠিকাদার (কাল্পনিক)')}</div><div class="b">${esc(nm(C1))}</div><div class="sm">${t('Track record (synthetic)', 'ট্র্যাক রেকর্ড (কৃত্রিম)')}: ${fmt(C1.score)}/${dig(100)}</div></div>
  <div><div class="sm mute">${t('Start → Deadline', 'শুরু → সময়সীমা')}</div><div class="b">${dig(p.start)} → ${dig(p.deadline)}</div><div class="sm">${a.ds.past ? pill('bad', t('Past by ' + a.ds.daysPast + ' days', fmt(a.ds.daysPast) + ' দিন পেরিয়েছে')) : pill('ok', t(a.ds.days + ' days left', fmt(a.ds.days) + ' দিন বাকি'))}</div></div></div>
  <div class="row" style="margin:10px 0">${C.flagPills(a) || pill('ok', t('No disbursement or deadline red flags', 'ছাড় বা সময়সীমার কোনো লাল ফ্ল্যাগ নেই'))}</div>${proj}`;
}
const votes = () => store.get('votes', {}), rev = () => store.get('reviewed', {});
function logs(p) {
  const v = votes(), r = rev();
  return p.logs.map(l => `<div class="log"><div class="row"><b>${dig(l.d)}</b>${l.photo ? pill('info', t('Photo attached (not machine-verified)', 'ছবি সংযুক্ত (মেশিন-যাচাইকৃত নয়)')) : pill('warn', t('No photo', 'ছবি নেই'))}</div><div>${esc(nm(l))}</div>
   <div class="row"><button class="btn ${v[l.id] === 'confirm' ? 'on' : ''}" data-vote="confirm|${l.id}" aria-pressed="${v[l.id] === 'confirm'}">▲ ${t('Confirm', 'নিশ্চিত')}</button><button class="btn ${v[l.id] === 'flag' ? 'on' : ''}" data-vote="flag|${l.id}" aria-pressed="${v[l.id] === 'flag'}">⚑ ${t('Flag', 'ফ্ল্যাগ')}</button>${role === 'overseer' ? `<button class="btn ${r[l.id] ? 'on' : ''}" data-rev="${l.id}" aria-pressed="${!!r[l.id]}">${r[l.id] ? '✔ ' : ''}${t('Mark reviewed (local note)', 'পর্যালোচিত চিহ্ন (লোকাল নোট)')}</button>` : ''}</div></div>`).join('') + `<p class="sm mute">${t('One action per log per browser, anonymous, stored only in this browser.', 'প্রতি লগে প্রতি ব্রাউজারে একটি অ্যাকশন, বেনামী, শুধু এই ব্রাউজারে সংরক্ষিত।')}</p>`;
}
function roleExtra(p, a) {
  const c = D.contractors[p.contractor], oth = C.allProjects().filter(q => q.contractor === p.contractor);
  if (role === 'citizen') return `<div class="card"><h3>${t('In plain words', 'সহজ কথায়')}</h3><p>${t('This project is ' + a.prog.toFixed(0) + '% complete and ' + a.disbPct.toFixed(0) + '% of its money has been released.', 'প্রকল্পটি ' + fmt(a.prog, 0) + '% সম্পন্ন এবং বাজেটের ' + fmt(a.disbPct, 0) + '% টাকা ছাড় হয়েছে।')} ${a.red.length ? t('Something here is marked for review.', 'এখানে কিছু পর্যালোচনার জন্য চিহ্নিত।') : ''}</p><a class="btn pri" href="../demo-user/">${t('Report a problem anonymously (demo)', 'বেনামে সমস্যা জানান (ডেমো)')}</a></div>`;
  if (role === 'journalist') return `<div class="card"><h3>${t('Journalist panel', 'সাংবাদিক প্যানেল')}</h3><p class="sm">${esc(nm(c))}: ${t('prior delays', 'আগের বিলম্ব')} ${fmt(c.priorDelays)}; ${t('projects in this seed data', 'এই সিড ডেটার প্রকল্প')}: ${oth.map(o => o.id).join(', ')}</p><p class="sm mute">${t('Flags are advisory. Ask the agency before publishing.', 'ফ্ল্যাগ পরামর্শমূলক। প্রকাশের আগে সংস্থার কাছে যাচাই করুন।')}</p><button class="btn" data-act="csv">${t('Download price audit CSV', 'মূল্য নিরীক্ষা সিএসভি ডাউনলোড')}</button></div>`;
  const n = p.logs.filter(l => rev()[l.id]).length;
  return `<div class="card"><h3>${t('Union overseer checklist', 'ইউনিয়ন তদারক চেকলিস্ট')}</h3><p>${t('Logs reviewed by you: ', 'আপনার পর্যালোচিত লগ: ')}${fmt(n)} / ${fmt(p.logs.length)}</p><p class="sm mute">${t('Local note only. Official approvals are not implemented.', 'শুধু লোকাল নোট। সরকারি অনুমোদন বাস্তবায়িত নয়।')}</p></div>`;
}
function copilotHTML(p) {
  return `<div class="card"><div class="row"><h3>${t('Retrieval copilot (rule-based)', 'রিট্রিভাল কোপাইলট (রুল-ভিত্তিক)')}</h3><span class="tag implemented">${t('Implemented', 'বাস্তবায়িত')}</span></div><p class="sm mute">${esc(t(D.kb.tag_en, D.kb.tag_bn))}</p>
  <div class="chat" aria-live="polite">${chat.map(m => `<div class="msg ${m.r}">${esc(m.x)}${m.ex ? `<div class="row" style="margin-top:6px">${m.ex.map(e => `<button class="btn" data-ask="${esc(e)}">${esc(e)}</button>`).join('')}</div>` : ''}${m.c && m.c.length ? `<div class="sm mute">${t('Source: ', 'সূত্র: ')}${esc(m.c.join(' · '))}</div>` : ''}</div>`).join('') || `<div class="msg a">${t('Ask about prices, delays, the projection, procurement or reporting.', 'দাম, বিলম্ব, প্রক্ষেপণ, ক্রয় বা অভিযোগ নিয়ে জিজ্ঞাসা করুন।')}</div>`}</div>
  <div class="row" style="margin:8px 0">${C.CHIPS.map(s => `<button class="btn" data-ask="${esc(t(s[0], s[1]))}">${t(s[0], s[1])}</button>`).join('')}</div>
  <div class="row" style="flex-wrap:nowrap"><label class="f" style="flex:1"><span class="sm">${t('Question', 'প্রশ্ন')}</span><input type="text" id="q" data-bn-ph="প্রশ্ন লিখুন" placeholder="Type a question"></label><button class="btn pri" data-act="ask">${t('Ask', 'জিজ্ঞাসা')}</button><button class="btn" data-act="voice" aria-label="${t('Voice input', 'ভয়েস ইনপুট')}">🎤</button></div></div>`;
}
function render() {
  const G = fixSel(), root = $('#app-root'), ps = C.unionProjects(sel.n); if (pi >= ps.length) pi = 0;
  const un = G.n; let main = '';
  if (!un.hasData) main = `<div class="card"><h2>${esc(nm(un))}: ${t('No data yet', 'এখনো ডেটা নেই')}</h2><p>${t('This union has no seed projects. Try a ★ union such as Ashulia, Birulia or Barabkunda.', 'এই ইউনিয়নের কোনো সিড প্রকল্প নেই। আশুলিয়া, বিরুলিয়া বা বারবকুণ্ডের মতো ★ ইউনিয়ন চেষ্টা করুন।')}</p></div>`;
  else {
    const au = ps.map(p => C.auditProject(p)), p = ps[pi], a = au[pi];
    const b = ps.reduce((s, x) => s + x.budget, 0), d = ps.reduce((s, x) => s + Math.min(x.disbursed, x.budget), 0);
    const tabs = [['overview', t('Overview', 'ওভারভিউ')], ['audit', t('Price audit', 'মূল্য নিরীক্ষা')], ['log', t('Daily log', 'দৈনিক লগ')]];
    main = `<h2>${esc(nm(un))} · ${t('projects', 'প্রকল্প')}</h2><div class="grid g4" style="margin:10px 0"><div class="card"><div class="sm mute">${t('Projects', 'প্রকল্প')}</div><div class="big">${fmt(ps.length)}</div></div><div class="card"><div class="sm mute">${t('Budget', 'বাজেট')}</div><div class="big">${bdt(b)}</div></div><div class="card"><div class="sm mute">${t('Disbursed', 'ছাড়কৃত')}</div><div class="big">${bdt(d)}</div></div><div class="card"><div class="sm mute">${t('Items for review', 'পর্যালোচনার আইটেম')}</div><div class="big">${fmt(au.reduce((s, x) => s + x.flagged + x.red.length, 0))}</div></div></div>
    <div class="grid g3">${ps.map(card).join('')}</div>
    <div class="card" style="margin-top:12px">${C.S.lite ? '' : `<figure class="banner"><img src="../assets/img/${esc(p.kind)}.svg" alt="${esc(t('Illustration of a ' + p.kind + ' project', 'প্রকল্পের চিত্র'))}" width="800" height="450"><figcaption>${t('Illustrative drawing, not a photo of the real site.', 'চিত্রটি উদাহরণমূলক অঙ্কন, প্রকৃত স্থানের ছবি নয়।')}</figcaption></figure>`}<h2>${esc(nm(p))}</h2><div class="sm mute">${esc(p.id)} · ${esc(C.agTxt(p.agency))} · ${esc(nm(D.agencies[p.agency].ministry_en ? { en: D.agencies[p.agency].ministry_en, bn: D.agencies[p.agency].ministry_bn } : p))}</div>
    <div class="tabs" role="tablist">${tabs.map(x => `<button role="tab" aria-selected="${tab === x[0]}" data-tab="${x[0]}">${x[1]}</button>`).join('')}</div>${tab === 'overview' ? overview(p, a) + gmapCard(p) : tab === 'audit' ? C.priceTableHTML(p, a) : logs(p)}</div>
    <div style="margin-top:12px">${roleExtra(p, a)}</div><div class="grid" style="margin-top:12px"><div class="card"><h3>${t('Knowledge graph', 'নলেজ গ্রাফ')}</h3>${C.graphHTML(p)}<p class="sm" id="node-d" aria-live="polite">${nodeId ? esc(C.nodeDetails(p, nodeId)) : t('Select a node for details.', 'বিস্তারিত দেখতে নোড নির্বাচন করুন।')}</p></div>${copilotHTML(p)}</div>`;
  }
  const mapCard = `<div class="card"><div class="row" style="justify-content:space-between"><h2>${t('Map', 'মানচিত্র')}</h2><span class="tag implemented">${t('Implemented', 'বাস্তবায়িত')}</span></div><p class="sm mute">${t('Schematic outline for orientation, not an official boundary. Click a division or a ★ union.', 'দিকনির্দেশের জন্য পরিকল্পিত রূপরেখা, সরকারি সীমানা নয়। বিভাগ বা ★ ইউনিয়নে ক্লিক করুন।')}</p>${C.S.lite ? mapListHTML() : mapHTML(sel)}</div>`;
  root.innerHTML = onboard() + `<div class="mapgrid">${mapCard}<div class="grid" style="align-content:start">${selectors(G)}${roleBar()}</div></div>` + `<div style="height:12px"></div>` + main;
  C.applyLangPh?.();
}
async function init() {
  await C.loadAll(); C.initShell(); render(); C.onLang(render); let wideNow = matchMedia('(max-width:760px)').matches; addEventListener('resize', () => { const m = matchMedia('(max-width:760px)').matches; if (m !== wideNow) { wideNow = m; render(); } });
  C.getWeather().then(w => { W = w; render(); });
  const root = $('#app-root');
  root.addEventListener('change', e => { const lv = e.target.dataset.lv; if (!lv) return; sel[lv] = e.target.value; if (lv === 'd') sel.s = sel.u = sel.n = ''; if (lv === 's') sel.u = sel.n = ''; if (lv === 'u') sel.n = ''; store.set('sel', sel); pi = 0; render(); });
  C.delegate(root, 'click', '[data-q]', b => { const [d, s, u, n] = b.dataset.q.split('/'); Object.assign(sel, { d, s, u, n }); store.set('sel', sel); pi = 0; tab = 'overview'; render(); });
  C.delegate(root, 'click', '[data-mapdiv]', g => { Object.assign(sel, { d: g.dataset.mapdiv, s: '', u: '', n: '' }); store.set('sel', sel); pi = 0; tab = 'overview'; render(); });
  C.delegate(root, 'click', '[data-mappin]', g => { const f = C.findUnion(g.dataset.mappin); if (!f) return; Object.assign(sel, { d: f.d.id, s: f.s.id, u: f.u.id, n: f.n.id }); store.set('sel', sel); pi = 0; tab = 'overview'; render(); });
  C.delegate(root, 'click', '[data-role]', b => { role = b.dataset.role; store.set('role', role); render(); });
  C.delegate(root, 'click', '[data-pi]', b => { pi = +b.dataset.pi; render(); });
  C.delegate(root, 'click', '[data-loadmap]', () => { mapOn = true; render(); });
  C.delegate(root, 'click', '[data-tab]', b => { tab = b.dataset.tab; render(); });
  C.delegate(root, 'click', '[data-vote]', b => { const [k, id] = b.dataset.vote.split('|'); const v = votes(); if (v[id] === k) delete v[id]; else v[id] = k; store.set('votes', v); render(); });
  C.delegate(root, 'click', '[data-rev]', b => { const r = rev(); r[b.dataset.rev] ? delete r[b.dataset.rev] : r[b.dataset.rev] = true; store.set('reviewed', r); render(); });
  C.delegate(root, 'click', '[data-node]', g => { nodeId = g.dataset.node; const p = C.unionProjects(sel.n)[pi]; $('#node-d').textContent = C.nodeDetails(p, nodeId); });
  C.delegate(root, 'keydown', '[data-node],[data-mapdiv],[data-mappin]', (g, e) => { if (e.key === 'Enter' || e.key === ' ') g.dispatchEvent(new Event('click', { bubbles: true })); });
  const ask = q => { q = (q || '').trim(); if (!q) return; const p = C.unionProjects(sel.n)[pi]; if (!p) return; const r = C.answer(q, p); chat.push({ r: 'u', x: q }, { r: 'a', x: r.text, c: r.cite, ex: r.examples }); render(); };
  C.delegate(root, 'click', '[data-ask]', b => ask(b.dataset.ask));
  C.delegate(root, 'click', '[data-act]', b => {
    const a = b.dataset.act;
    if (a === 'onb') { store.set('onb', true); render(); }
    if (a === 'ask') ask($('#q').value);
    if (a === 'voice') C.voice(txt => { $('#q').value = txt; ask(txt); });
    if (a === 'csv') { const p = C.unionProjects(sel.n)[pi], au = C.auditProject(p); C.download(p.id + '-price-audit.csv', 'material,qty,billed,benchmark,pct_over,level\n' + au.rows.map(r => [r.k, r.qty, r.billed, r.bench, r.pct.toFixed(1), r.level].join(',')).join('\n'), 'text/csv'); }
  });
  root.addEventListener('keydown', e => { if (e.target.id === 'q' && e.key === 'Enter') ask(e.target.value); });
}
init().catch(e => { $('#app-root').innerHTML = `<div class="card"><h2>${t('Could not load data', 'ডেটা লোড করা যায়নি')}</h2><p>${esc(e.message)}</p></div>`; });
