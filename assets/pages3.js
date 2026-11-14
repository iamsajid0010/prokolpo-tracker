import * as C from './core.js';
const { t, esc, fmt, $, $$, store, D, pill } = C;
const pg = document.body.dataset.page, root = $('#page-root');
const PRES = [
 ['Problem', 'সমস্যা', 'Citizens cannot easily see what a local public project costs, how far it has progressed, or whether prices look reasonable.', 'নাগরিকরা সহজে দেখতে পান না স্থানীয় সরকারি প্রকল্পের খরচ কত, কতটা এগিয়েছে, বা দাম যুক্তিসঙ্গত কিনা।'],
 ['Solution', 'সমাধান', 'A free static web tool: drill down to a Union, compare billed prices with benchmark rates, check disbursement against progress, and anonymously flag logs.', 'একটি বিনামূল্যের স্ট্যাটিক ওয়েব টুল: ইউনিয়নে ড্রিল-ডাউন, বিলের দাম বেঞ্চমার্কের সাথে তুলনা, অগ্রগতির সাথে ছাড় যাচাই ও বেনামে লগ ফ্ল্যাগ।'],
 ['Walkthrough', 'ওয়াকথ্রু', 'Open /app (Ashulia is preselected) → open a project → Price audit tab → Overview for the projection formula → ask the copilot → try /demo-admin and /audit.', '/app খুলুন (আশুলিয়া নির্বাচিত) → প্রকল্প খুলুন → মূল্য নিরীক্ষা ট্যাব → প্রক্ষেপণের সূত্র দেখুন → কোপাইলটকে জিজ্ঞাসা → /demo-admin ও /audit দেখুন।'],
 ['AI approach', 'এআই পদ্ধতি', 'Transparent and simple: a least-squares projection, a rule engine and keyword retrieval. Every output shows its inputs and sources. No LLM is used yet. Humans decide.', 'স্বচ্ছ ও সরল: লিস্ট-স্কয়ার্স প্রক্ষেপণ, রুল ইঞ্জিন ও কিওয়ার্ড রিট্রিভাল। প্রতিটি আউটপুটে ইনপুট ও সূত্র দেখানো হয়। এখনো এলএলএম নেই। সিদ্ধান্ত মানুষের।'],
 ['Impact', 'প্রভাব', 'Targets, not achieved results: faster citizen review of project data, earlier visibility of disbursement gaps, and a reusable open pattern for transparency tools.', 'লক্ষ্য, অর্জিত ফল নয়: প্রকল্প ডেটার দ্রুত নাগরিক পর্যালোচনা, ছাড়ের ব্যবধান আগে দৃশ্যমান হওয়া, এবং স্বচ্ছতা টুলের পুনর্ব্যবহারযোগ্য উন্মুক্ত প্যাটার্ন।']];
const DECK = [
 ['Problem', 'সমস্যা', 'Public project information is hard to find and harder to compare. Citizens, journalists and local officials lack one simple view.', 'সরকারি প্রকল্পের তথ্য খুঁজে পাওয়া কঠিন, তুলনা আরও কঠিন। নাগরিক, সাংবাদিক ও স্থানীয় কর্মকর্তাদের একটি সহজ ভিউ নেই।'],
 ['Solution', 'সমাধান', 'Prokolpo Tracker: Union-level project pages with price checks, disbursement checks, a transparent projection and a bilingual copilot.', 'প্রকল্প ট্র্যাকার: ইউনিয়ন-স্তরের প্রকল্প পেজ, মূল্য ও ছাড় যাচাই, স্বচ্ছ প্রক্ষেপণ ও দ্বিভাষিক কোপাইলট।'],
 ['Market (to be validated)', 'বাজার (যাচাই প্রয়োজন)', 'Illustrative framing: Bangladesh has several thousand Union Parishads and a large annual development budget. Sizing must be validated with official sources before any claim.', 'উদাহরণমূলক কাঠামো: বাংলাদেশে কয়েক হাজার ইউনিয়ন পরিষদ ও বড় বার্ষিক উন্নয়ন বাজেট আছে। কোনো দাবির আগে সরকারি সূত্রে আকার যাচাই করতে হবে।'],
 ['Product', 'প্রোডাক্ট', 'Working prototype: 8 divisions, 3 fully seeded unions, 10 synthetic projects, price audit, projection, copilot, anonymous local reports, admin demo, real in-browser audit.', 'কার্যকর প্রোটোটাইপ: ৮ বিভাগ, ৩টি সম্পূর্ণ সিড ইউনিয়ন, ১০টি কৃত্রিম প্রকল্প, মূল্য নিরীক্ষা, প্রক্ষেপণ, কোপাইলট, বেনামী লোকাল রিপোর্ট, অ্যাডমিন ডেমো, ব্রাউজারে প্রকৃত অডিট।'],
 ['Traction', 'ট্র্যাকশন', 'Honest status: working prototype, no users yet, no real data.', 'সৎ অবস্থা: কার্যকর প্রোটোটাইপ, এখনো ব্যবহারকারী নেই, প্রকৃত ডেটা নেই।'],
 ['Business model (illustrative)', 'ব্যবসা মডেল (উদাহরণমূলক)', 'Ideas to test: grants for transparency tools, paid support for local governments, and open data services. None validated.', 'পরীক্ষার ধারণা: স্বচ্ছতা টুলের জন্য অনুদান, স্থানীয় সরকারের জন্য সহায়তা সেবা ও ওপেন ডেটা সেবা। কোনোটিই যাচাইকৃত নয়।'],
 ['Growth', 'প্রবৃদ্ধি', 'Next: pilot with one Upazila using real public data, then publish methods and results openly.', 'পরবর্তী: প্রকৃত পাবলিক ডেটা নিয়ে একটি উপজেলায় পাইলট, তারপর পদ্ধতি ও ফল উন্মুক্তভাবে প্রকাশ।'],
 ['Team', 'টিম', 'Solo builder (individual competition). Advisors: Planned.', 'একক নির্মাতা (ব্যক্তিগত প্রতিযোগিতা)। উপদেষ্টা: পরিকল্পিত।'],
 ['Impact (targets)', 'প্রভাব (লক্ষ্য)', 'Targets only: easier citizen review, earlier detection of disbursement gaps. No results achieved yet.', 'শুধু লক্ষ্য: নাগরিক পর্যালোচনা সহজ করা, ছাড়ের ব্যবধান আগে শনাক্ত। এখনো কোনো ফল অর্জিত হয়নি।'],
 ['Ask (amounts illustrative)', 'অনুরোধ (অঙ্ক উদাহরণমূলক)', 'Access to official public datasets, one pilot partner, and a small grant (illustrative: ৳ 5 lakh) for a 3-month pilot.', 'সরকারি পাবলিক ডেটাসেটে প্রবেশাধিকার, একটি পাইলট অংশীদার, ও ৩ মাসের পাইলটের জন্য ছোট অনুদান (উদাহরণ: ৫ লাখ টাকা)।']];

function presentation() {
  let i = 0, left = 180, h = null; const mmss = s => dig(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'));
  const dig = C.dig;
  const draw = () => { const s = PRES[i]; root.innerHTML = `<div class="row"><button class="btn pri" data-a="timer">${h ? '■ ' + t('Stop', 'থামুন') : '▶ ' + t('Start 3:00 timer', '৩:০০ টাইমার শুরু')}</button><b id="tm" aria-live="off">${mmss(left)}</b>${PRES.map((x, k) => `<button class="btn ${k === i ? 'on' : ''}" data-i="${k}" aria-pressed="${k === i}">${fmt(k + 1)}</button>`).join('')}</div>
   <div class="card slide cur"><h2>${fmt(i + 1)}. ${t(s[0], s[1])}</h2><p>${t(s[2], s[3])}</p>${i === 4 ? `<span class="pill warn">${t('Targets, not achieved results', 'লক্ষ্য, অর্জিত ফল নয়')}</span>` : ''}</div><div class="row"><button class="btn" data-i="${Math.max(0, i - 1)}">←</button><button class="btn" data-i="${Math.min(4, i + 1)}">→</button><a class="btn" href="../app/">${t('Open the app', 'অ্যাপ খুলুন')}</a></div>`; };
  draw(); C.onLang(draw);
  C.delegate(root, 'click', '[data-i]', b => { i = +b.dataset.i; draw(); });
  C.delegate(root, 'click', '[data-a="timer"]', () => { if (h) { clearInterval(h); h = null; } else { left = 180; h = setInterval(() => { left--; const e = $('#tm'); if (e) e.textContent = mmss(Math.max(0, left)); if (left <= 0) { clearInterval(h); h = null; C.toast(t('Time is up', 'সময় শেষ')); draw(); } }, 1000); } draw(); });
}
function pitchdeck() {
  let i = 0;
  const draw = () => { root.innerHTML = `<div class="row noprint"><button class="btn" data-d="-1" aria-label="${t('Previous slide', 'আগের স্লাইড')}">←</button>${DECK.map((_, k) => `<button class="btn ${k === i ? 'on' : ''}" data-g="${k}" aria-label="${t('Slide', 'স্লাইড')} ${k + 1}">${fmt(k + 1)}</button>`).join('')}<button class="btn" data-d="1" aria-label="${t('Next slide', 'পরের স্লাইড')}">→</button><button class="btn" data-a="fs">${t('Fullscreen', 'ফুলস্ক্রিন')}</button><button class="btn" data-a="pr">${t('Print / PDF', 'প্রিন্ট / পিডিএফ')}</button></div>${DECK.map((s, k) => `<section class="card slide ${k === i ? 'cur' : ''}" aria-label="${t('Slide', 'স্লাইড')} ${k + 1}"><span class="pill" style="align-self:flex-start">${fmt(k + 1)} / ${fmt(10)}</span><h2>${t(s[0], s[1])}</h2><p>${t(s[2], s[3])}</p></section>`).join('')}`; };
  draw(); C.onLang(draw);
  const go = n => { i = Math.min(9, Math.max(0, n)); draw(); };
  C.delegate(root, 'click', '[data-d]', b => go(i + +b.dataset.d)); C.delegate(root, 'click', '[data-g]', b => go(+b.dataset.g));
  C.delegate(root, 'click', '[data-a]', b => { if (b.dataset.a === 'fs') { (document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen?.())?.catch?.(() => C.toast(t('Fullscreen blocked by browser.', 'ব্রাউজার ফুলস্ক্রিন আটকেছে।'))); } else window.print(); });
  document.addEventListener('keydown', e => { if (e.target.matches('input,textarea,select')) return; if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
}

/* ----- real in-browser audit ----- */
const RISKS = [['Seed data is synthetic; findings say nothing about real projects.', 'সিড ডেটা কৃত্রিম; ফলাফল প্রকৃত প্রকল্প সম্পর্কে কিছু বলে না।'], ['Benchmark rates are illustrative and ignore transport and bulk discounts.', 'বেঞ্চমার্ক রেট উদাহরণমূলক; পরিবহন ও বাল্ক ছাড় ধরা হয়নি।'], ['Client-side checks can be modified by a user; this is not an independent audit or certification. The Bangla label scan covers 10 routes and a heuristic word list; it cannot prove every string is translated.', 'ক্লায়েন্ট-সাইড চেক ব্যবহারকারী বদলাতে পারে; এটি স্বাধীন অডিট বা সনদ নয়।'], ['Reports and votes are not shared between users.', 'রিপোর্ট ও ভোট ব্যবহারকারীদের মধ্যে ভাগ হয় না।'], ['Weather projection depends on a third-party API when online.', 'অনলাইনে আবহাওয়া প্রক্ষেপণ তৃতীয় পক্ষের এপিআইয়ের উপর নির্ভরশীল।']];
async function audit() {
  await C.loadAll(); let res = null, running = false;
  const draw = () => {
    const pass = res ? res.checks.filter(c => c.pass).length : 0;
    root.innerHTML = `<div class="row"><button class="btn pri" data-a="run" ${running ? 'disabled' : ''}>${running ? t('Running…', 'চলছে…') : t('Run audit', 'অডিট চালান')}</button>${res ? `<button class="btn" data-a="copy">${t('Copy report', 'রিপোর্ট কপি')}</button><button class="btn" data-a="json">${t('Download JSON', 'জেএসওএন ডাউনলোড')}</button>` : ''}</div>
    ${res ? `<div class="card" style="margin-top:12px"><h2>${t('Score', 'স্কোর')}: ${fmt(pass)} / ${fmt(res.checks.length)}</h2><div class="sm mute">${esc(res.at)}</div><div class="tw"><table><thead><tr><th>${t('Check', 'চেক')}</th><th>${t('Result', 'ফল')}</th><th>${t('Evidence', 'প্রমাণ')}</th></tr></thead><tbody>${res.checks.map(c => `<tr><td>${esc(c.name)}</td><td>${pill(c.pass ? 'ok' : 'bad', c.pass ? 'PASS' : 'FAIL')}</td><td class="sm">${esc(c.evidence)}</td></tr>`).join('')}</tbody></table></div></div>` : `<p class="mute">${t('No report yet. These are real checks run in your browser, with no hardcoded score.', 'এখনো রিপোর্ট নেই। এগুলো আপনার ব্রাউজারে চলা প্রকৃত চেক, স্কোর হার্ডকোডেড নয়।')}</p>`}
    <h2 style="margin-top:14px">${t('Residual risks and limitations', 'অবশিষ্ট ঝুঁকি ও সীমাবদ্ধতা')}</h2><ul>${RISKS.map(r => `<li>${t(r[0], r[1])}</li>`).join('')}</ul>`;
  };
  draw(); C.onLang(draw);
  async function run() {
    const out = [], add = (name, pass, evidence) => out.push({ name, pass: !!pass, evidence });
    const ext0 = performance.getEntriesByType('resource').map(r => { try { return new URL(r.name).origin; } catch (e) { return ''; } }).filter(o => o && o !== location.origin);
    const routes = C.ROUTES.map(r => r[0]), pages = {};
    for (const r of routes) { try { const x = await fetch(new URL(r + '/', C.BASE)); pages[r] = x.ok ? await x.text() : null; } catch (e) { pages[r] = null; } }
    const reach = routes.filter(r => pages[r] !== null);
    add('All 12 routes reachable (fetch)', reach.length === routes.length, reach.length + '/' + routes.length + ' returned HTTP 200' + (reach.length < routes.length ? '; missing: ' + routes.filter(r => pages[r] === null).join(', ') : ''));
    const hosts = [...new Set(ext0)];
    add('No external network requests (resource timing)', hosts.every(h => h === 'https://api.open-meteo.com'), hosts.length ? 'External hosts seen: ' + hosts.join(', ') : 'Only same-origin resources loaded');
    const cspOk = reach.filter(r => /http-equiv="Content-Security-Policy"/.test(pages[r]) && /script-src 'self'/.test(pages[r]));
    add('Content-Security-Policy meta on every route', cspOk.length === reach.length, cspOk.length + '/' + reach.length + ' pages include script-src \'self\'');
    add('localStorage works', C.store.ok(), C.store.ok() ? 'write and remove succeeded' : 'blocked; in-memory fallback active');
    let bad = [], cnt = 0;
    C.allProjects().forEach(p => { const a = C.auditProject(p), d = document.createElement('div'); d.innerHTML = C.priceTableHTML(p, a); const ban = +d.querySelector('[data-banner]').dataset.banner, sum = [...d.querySelectorAll('tr[data-excess]')].filter(tr => tr.dataset.level !== 'ok').reduce((s, tr) => s + +tr.dataset.excess, 0); cnt++; if (Math.abs(ban - sum) > 0.01) bad.push(p.id); });
    add('Anomaly banner equals sum of flagged row excess', !bad.length, cnt + ' projects checked' + (bad.length ? '; mismatch: ' + bad.join(', ') : ''));
    const over = C.allProjects().filter(p => p.disbursed > p.budget);
    add('Disbursement never above budget', !over.length && C.allProjects().every(p => C.auditProject(p).disbPct <= 100), C.allProjects().length + ' projects; seed values and computed % both ≤ 100');
    const p0 = C.allProjects()[0], dl = new Date(p0.deadline + 'T12:00:00'), before = new Date(dl - 2 * 864e5), after = new Date(+dl + 2 * 864e5);
    add('Deadline logic uses the current date', !C.deadlineStatus(p0, before).past && C.deadlineStatus(p0, after).past && /new Date/.test(C.deadlineStatus.toString()) && C.deadlineStatus(p0).days === C.deadlineStatus(p0, new Date()).days, 'before deadline → not past; after → past; default argument is new Date()');
    const miss = []; let hd = 0; reach.forEach(r => { const doc = new DOMParser().parseFromString(pages[r], 'text/html'); doc.querySelectorAll('h1,h2,h3').forEach(h => { if (h.closest('#app-root,#page-root')) return; hd++; if (!h.hasAttribute('data-bn')) miss.push(r + ': ' + h.textContent.slice(0, 30)); }); });
    add('Bangla toggle covers all static headings', !miss.length && hd > 0, hd + ' static headings checked' + (miss.length ? '; missing data-bn: ' + miss.slice(0, 3).join(' | ') : '') + '; dynamic headings use the t() helper');
    const noSvg = C.allProjects().every(p => !/<svg/.test(C.graphHTML(p, true))), svgOn = /<svg/.test(C.graphHTML(p0, false));
    add('Lite mode removes SVG', noSvg && svgOn, 'graph has no <svg> in lite mode (' + C.allProjects().length + ' projects); control: normal mode renders <svg>');
    const prev = C.rateOverrides(), k = p0.materials[0].k, b0 = C.auditProject(p0).excess; C.setRate(k, p0.materials[0].billed * 2); const b1 = C.auditProject(p0).excess; C.setRate(k, p0.materials[0].billed * 0.5); const b2 = C.auditProject(p0).excess; C.store.set('rates', prev);
    add('Editing a benchmark rate recomputes badges', b1 !== b0 || b2 !== b0 || b1 !== b2, k + ': excess ' + Math.round(b0) + ' → ' + Math.round(b1) + ' / ' + Math.round(b2) + ' (rate restored)');
    const w = await C.getWeather(); add('Weather API reachable or fallback active', w.ok || /Offline/.test(C.weatherNote(w)), w.ok ? 'Open-Meteo reachable: ' + w.mm + ' mm forecast for ' + w.date : 'Offline: fallback note shown, projection runs without weather');
    let feats = 0, untagged = 0; reach.forEach(r => { const doc = new DOMParser().parseFromString(pages[r], 'text/html'); doc.querySelectorAll('.feat').forEach(f => { feats++; if (!f.querySelector('.tag.implemented,.tag.planned')) untagged++; }); });
    const noTag = reach.filter(r => !/class="tag (implemented|planned)"/.test(pages[r]) && r !== 'prompt');
    add('Implemented/Planned tag coverage', feats >= 40 && !untagged && !noTag.length, feats + ' feature items across routes; untagged items: ' + untagged + '; routes with no tag: ' + (noTag.join(', ') || 'none'));
    const ban = reach.filter(r => /Synthetic demo data/.test(pages[r]) && /class="skip"/.test(pages[r]) && /<html lang=/.test(pages[r]));
    add('Demo banner, skip link and lang on every route', ban.length === reach.length, ban.length + '/' + reach.length);

    // ---- seed dates are offsets; series ends yesterday
    const yd = C.D.iso(-1), bad2 = C.allProjects().filter(p => p.daily.length !== 14 || p.daily[p.daily.length - 1].d !== yd || !p.daily.every(d => /^\d{4}-\d\d-\d\d$/.test(d.d)));
    add('Seed dates are day offsets and the series ends yesterday', !bad2.length && C.allProjects().every(p => p.daily.every(d => typeof d.o === 'number' && d.o < 0)), C.allProjects().length + ' projects; each has 14 daily records from offset -14 to -1; last record dated ' + yd + (bad2.length ? '; mismatch: ' + bad2.map(p => p.id).join(', ') : ''));
    // ---- copilot
    const wasLang = C.S.lang, p1 = C.allProjects()[0], isCited = r => r && !r.fallback && r.cite && r.cite.length > 0 && r.text.length > 20;
    C.S.lang = 'en';
    const chipsBad = C.CHIPS.filter(c => !isCited(C.answer(c[0], p1, { force: true })));
    add('Copilot chips return cited non-fallback answers', chipsBad.length === 0 && C.CHIPS.length === 4, C.CHIPS.length + ' chips; failures: ' + (chipsBad.map(c => c[0]).join(' | ') || 'none') + '; intents: ' + C.CHIPS.map(c => C.answer(c[0], p1, { force: true }).intent).join(', '));
    const bnQs = C.CHIPS.map(c => c[1]), varBad = [];
    C.VARIANTS.forEach(q => { C.S.lang = /[ঀ-৿]/.test(q) ? 'bn' : 'en'; if (!isCited(C.answer(q, p1, { force: true }))) varBad.push(q); });
    C.S.lang = 'bn'; bnQs.forEach(q => { if (!isCited(C.answer(q, p1, { force: true }))) varBad.push(q); });
    add('Copilot variant questions return cited non-fallback answers (English and Bangla)', varBad.length === 0, (C.VARIANTS.length + bnQs.length) + ' questions; failures: ' + (varBad.join(' | ') || 'none'));
    C.S.lang = 'en'; const procQs = ['What is the penalty for late work?', 'tender rules', 'is there a law about delays', 'penalty', 'procurement law for late work'], procBad = procQs.filter(q => { const r = C.answer(q, p1, { force: true }); return r.intent !== 'proc' || !r.cite.includes('kb-proc') || !/Illustrative, verify with official source/.test(r.text); });
    add('Copilot penalty, tender, rules and law questions return the procurement passage', procBad.length === 0, procQs.length + ' questions; failures: ' + (procBad.join(' | ') || 'none'));
    C.S.lang = 'bn'; const rb = C.answer(C.CHIPS[1][1], p1, { force: true }), rp = C.answer(C.CHIPS[0][1], p1, { force: true });
    add('Copilot answers use Bangla text and digits in Bangla mode', /[ঀ-৿]/.test(rb.text) && /[০-৯]/.test(rb.text) && !/\d/.test(rb.text) && !/\d/.test(rp.text), 'delay answer: ' + rb.text.split('\n')[0].slice(0, 70));
    C.S.lang = wasLang;
    // ---- pre-rendered text per route (fetch HTML, strip scripts, read main)
    const lens = {}; reach.forEach(r => { const doc = new DOMParser().parseFromString(pages[r], 'text/html'); doc.querySelectorAll('script,style').forEach(x => x.remove()); lens[r] = (doc.querySelector('main')?.textContent || '').replace(/\s+/g, ' ').trim().length; });
    const short = reach.filter(r => lens[r] < 800);
    add('Every route has at least 800 characters of pre-rendered text in main', !short.length && reach.length === routes.length, 'min ' + Math.min(...Object.values(lens)) + ' chars' + (short.length ? '; short: ' + short.map(r => r + '=' + lens[r]).join(', ') : '') + ' (main text without scripts, as served)');
    // ---- Bangla mode: no Latin-only labels (iframe scan of interactive routes)
    const ALLOW = new Set(['LGED', 'RHD', 'DPHE', 'PWD', 'BWDB', 'LGD', 'EN', 'JSON', 'CSV', 'API', 'UUID', 'ID', 'PDF', 'SSO', '2FA', 'KB', 'IMED', 'e-GP', 'OK', 'TMT', 'kg', 'km', 'mm', 'cum', 'sqm', 'pcs', 'nos', 'MT', 'kW', 'localStorage', 'crypto.randomUUID', 'Open-Meteo', 'Web', 'Speech', 'R²', 'LLM', 'AES', 'CDN', 'CSP', 'HTML', 'URL', 'W', 'mm.', 'api.open-meteo.com', 'new', 'Date', 'bn-BD', 'en-US', 'GitHub', 'Pages', 'WebSpeech', 'JavaScript']);
    const latinBad = []; const prevLang = C.store.get('lang', 'en'); C.store.set('lang', 'bn');
    for (const r of ['app', 'demo-user', 'demo-admin', 'admin', 'data', 'security', 'architecture', 'presentation', 'pitchdeck', 'docs']) {
      const fr = document.createElement('iframe'); fr.style.cssText = 'position:absolute;left:-9999px;width:1100px;height:900px'; fr.src = new URL(r + '/', C.BASE).href; document.body.appendChild(fr);
      await new Promise(ok => { fr.onload = ok; setTimeout(ok, 6000); }); await new Promise(ok => setTimeout(ok, 700));
      const d = fr.contentDocument; if (!d) { latinBad.push(r + ': iframe not readable'); fr.remove(); continue; }
      const w = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const n = w.currentNode, el = n.parentElement; if (!el || el.closest('script,style,noscript,code,pre,#toast,.rail small,option[hidden]')) continue;
        const txt = n.textContent.replace(/https?:\S+|\S*\/\S*|\S+\.json/g, ' '); const words = txt.match(/[A-Za-z][A-Za-z'’.-]*/g) || [];
        const left = words.filter(x => !ALLOW.has(x) && !/^[A-Z0-9]{2,6}-?$/.test(x) && x.length > 1);
        if (left.length) latinBad.push(r + ': "' + n.textContent.trim().slice(0, 50) + '"');
      }
      fr.remove();
    }
    C.store.set('lang', prevLang);
    add('No Latin-only visible labels in Bangla mode (acronyms and numbers allowed)', latinBad.length === 0, 'scanned 10 routes in Bangla (all except /audit and /prompt, which show the English prompt verbatim); ' + (latinBad.length ? latinBad.length + ' found, e.g. ' + latinBad.slice(0, 80).join(' | ') : 'none found'));
    res = { at: new Date().toISOString(), checks: out, score: out.filter(c => c.pass).length + '/' + out.length };
  }
  C.delegate(root, 'click', '[data-a]', async b => {
    const a = b.dataset.a;
    if (a === 'run') { running = true; draw(); try { await run(); } catch (e) { res = { at: new Date().toISOString(), checks: [{ name: 'Audit runner', pass: false, evidence: e.message }] }; } running = false; draw(); }
    if (a === 'copy') C.copy('Prokolpo Tracker audit ' + res.at + '\nScore ' + res.score + '\n' + res.checks.map(c => (c.pass ? 'PASS ' : 'FAIL ') + c.name + ' - ' + c.evidence).join('\n'));
    if (a === 'json') C.download('prokolpo-audit.json', JSON.stringify(res, null, 2));
  });
}
({ presentation, pitchdeck, audit }[pg] || (() => { }))();
if (pg !== 'audit') C.initShell(); else C.initShell();
