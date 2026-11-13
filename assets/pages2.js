import * as C from './core.js';
const { t, esc, fmt, bdt, nm, dig, pill, $, $$, store, D } = C;
const pg = document.body.dataset.page;
const LAYERS = [
 ['User Interaction', 'ব্যবহারকারী ইন্টারঅ্যাকশন', ['Static pages, EN/বাংলা toggle, lite mode, dark mode, browser voice input (Web Speech API)', 'No native mobile app'], ['স্ট্যাটিক পেজ, EN/বাংলা টগল, লাইট মোড, ডার্ক মোড, ব্রাউজার ভয়েস ইনপুট', 'নেটিভ মোবাইল অ্যাপ নেই'], 1],
 ['Application Logic', 'অ্যাপ্লিকেশন লজিক', ['Rules engine in JavaScript: price flags, disbursement and deadline checks'], ['জাভাস্ক্রিপ্টে রুল ইঞ্জিন: মূল্য ফ্ল্যাগ, ছাড় ও সময়সীমা যাচাই'], 1],
 ['AI Intelligence', 'এআই ইন্টেলিজেন্স', ['Least-squares progress projection (statistics, not machine learning)'], ['লিস্ট-স্কয়ার্স অগ্রগতি প্রক্ষেপণ (পরিসংখ্যান, মেশিন লার্নিং নয়)', 'LLM-based assistant: Planned'], 1],
 ['Knowledge Retrieval', 'নলেজ রিট্রিভাল', ['Keyword and passage retrieval over a local JSON knowledge base', 'Vector database: Planned'], ['স্থানীয় জেএসওএন নলেজ বেসে কিওয়ার্ড ও প্যাসেজ রিট্রিভাল', 'ভেক্টর ডেটাবেস: পরিকল্পিত'], 1],
 ['Agent Orchestration', 'এজেন্ট অর্কেস্ট্রেশন', ['Not built'], ['তৈরি হয়নি'], 0],
 ['Data Infrastructure', 'ডেটা ইনফ্রাস্ট্রাকচার', ['Synthetic seed JSON files served as static assets', 'Real databases and official source integrations: Planned'], ['কৃত্রিম সিড জেএসওএন ফাইল স্ট্যাটিক অ্যাসেট হিসেবে', 'প্রকৃত ডেটাবেস ও সরকারি সূত্র ইন্টিগ্রেশন: পরিকল্পিত'], 1],
 ['Automation', 'অটোমেশন', ['Not built (no scrapers, no scheduled jobs)'], ['তৈরি হয়নি (স্ক্র্যাপার বা শিডিউলড জব নেই)'], 0],
 ['Deployment', 'ডেপ্লয়মেন্ট', ['Static hosting (Vercel or GitHub Pages)', 'Bangladesh-region hosting: Planned'], ['স্ট্যাটিক হোস্টিং (ভার্সেল বা গিটহাব পেজেস)', 'বাংলাদেশ-অঞ্চলে হোস্টিং: পরিকল্পিত'], 1]];
const FLOW = [['User picks a union', 'ব্যবহারকারী ইউনিয়ন বাছে'], ['Browser reads seed JSON from the same site', 'ব্রাউজার একই সাইট থেকে সিড জেএসওএন পড়ে'], ['Rules engine compares billed prices with benchmark rates and checks deadline and disbursement', 'রুল ইঞ্জিন বিলের দাম বেঞ্চমার্কের সাথে মেলায়, সময়সীমা ও ছাড় যাচাই করে'], ['Projection fits a line to 14 daily records; optional Open-Meteo rain call adjusts the slope', '১৪টি দৈনিক রেকর্ডে রেখা ফিট; ঐচ্ছিক ওপেন-মেটিও কল ঢাল সমন্বয় করে'], ['UI shows badges with sources; a person decides', 'ইউআই সূত্রসহ ব্যাজ দেখায়; সিদ্ধান্ত মানুষের'], ['Votes, flags and reports are saved in localStorage only', 'ভোট, ফ্ল্যাগ ও রিপোর্ট শুধু লোকালস্টোরেজে সংরক্ষিত']];

function slots() { // render SVG templates unless lite
  $$('.svg-slot').forEach(s => { const tpl = s.querySelector('template'); const alt = s.parentElement.querySelector('.svg-alt'); if (C.S.lite) { s.querySelectorAll('svg').forEach(x => x.remove()); if (alt) alt.hidden = false; } else { if (!s.querySelector('svg') && tpl) s.appendChild(tpl.content.cloneNode(true)); if (alt) alt.hidden = true; } });
}
async function main() {
  C.initShell(); slots(); C.onLang(slots);
  if (pg === 'architecture') {
    let i = 0, step = 0; const el = $('#layer-ui');
    const draw = () => { const L = LAYERS[i]; el.innerHTML = `<div class="grid g2"><div style="display:flex;flex-direction:column;gap:6px">${LAYERS.map((l, k) => `<button class="layer" data-l="${k}" aria-pressed="${k === i}"><b>${fmt(k + 1)}</b><span style="flex:1">${t(l[0], l[1])}</span>${C.tagHTML(l[4] ? 'implemented' : 'planned')}</button>`).join('')}</div><div class="card"><h2>${fmt(i + 1)}. ${t(L[0], L[1])}</h2><ul>${(C.S.lang === 'bn' ? L[3] : L[2]).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    <h2 style="margin-top:14px">${t('Request flow walkthrough', 'অনুরোধ প্রবাহ ওয়াকথ্রু')}</h2><div class="card"><div class="row">${FLOW.map((f, k) => `<button class="btn ${k === step ? 'on' : ''}" data-s="${k}" aria-pressed="${k === step}">${fmt(k + 1)}</button>`).join('')}</div><p style="font-size:1.05rem">${esc(t(FLOW[step][0], FLOW[step][1]))}</p></div>`; };
    draw(); C.onLang(draw);
    C.delegate(el, 'click', '[data-l]', b => { i = +b.dataset.l; draw(); }); C.delegate(el, 'click', '[data-s]', b => { step = +b.dataset.s; draw(); });
  }
  if (pg === 'data') {
    await C.loadAll();
    const draw = () => {
      const p = C.allProjects()[0], a = C.auditProject(p), r = a.rows.find(x => x.level !== 'ok') || a.rows[0], m = D.benchmarks.materials[r.k];
      $('#lineage').innerHTML = `<ol><li>${t('Seed file', 'সিড ফাইল')}: <code>data/projects.json</code> → ${esc(p.id)}, ${esc(r.k)}: ${t('quantity', 'পরিমাণ')} ${fmt(r.qty)} ${esc(m.unit)}, ${t('billed', 'বিল')} ৳${fmt(r.billed, 2)}</li><li>${t('Benchmark file', 'বেঞ্চমার্ক ফাইল')}: <code>data/benchmarks.json</code> → ৳${fmt(r.bench, 2)}</li><li>${t('Rule', 'রুল')}: (${fmt(r.billed, 2)} − ${fmt(r.bench, 2)}) ÷ ${fmt(r.bench, 2)} = ${fmt(r.pct, 1)}%</li><li>${t('Badge', 'ব্যাজ')}: ${pill(r.level, C.lvlText(r))} (${t('amber above 5%, red above 15%', '৫% এর উপরে অ্যাম্বার, ১৫% এর উপরে লাল')})</li></ol>`;
    };
    draw(); C.onLang(draw);
    $$('[data-dl]').forEach(b => b.addEventListener('click', async () => { const r = await fetch(new URL('data/' + b.dataset.dl + '.json', C.BASE)); C.download(b.dataset.dl + '.json', await r.text()); }));
  }
  if (pg === 'prompt' || pg === 'docs') $$('[data-copy]').forEach(b => b.addEventListener('click', () => C.copy($(b.dataset.copy).textContent)));
}
main().catch(e => { const m = $('main'); if (m) m.insertAdjacentHTML('beforeend', `<div class="card">${esc(e.message)}</div>`); });
