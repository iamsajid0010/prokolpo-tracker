import * as C from './core.js';
const { t, esc, fmt, bdt, nm, dig, pill, $, store, D } = C;
const pg = document.body.dataset.page, root = $('#page-root');
const allAudits = () => C.allProjects().map(p => ({ p, a: C.auditProject(p) }));
function findings() {
  const out = [];
  allAudits().forEach(({ p, a }) => {
    a.rows.filter(r => r.level !== 'ok').forEach(r => out.push({ id: p.id + ':' + r.k, p, kind: r.level, text: nm(D.benchmarks.materials[r.k]) + ' · ' + C.lvlText(r) }));
    a.red.forEach(k => out.push({ id: p.id + ':' + k, p, kind: 'bad', text: C.redText(k) }));
  });
  return out;
}
const alertsHTML = list => list.length ? list.map(f => `<div class="card"><div class="row">${pill(f.kind, f.kind === 'ok' ? 'ok' : f.kind === 'bad' ? t('Review recommended', 'পর্যালোচনা সুপারিশকৃত') : t('Above benchmark', 'বেঞ্চমার্কের উপরে'))}<b>${esc(nm(f.p))}</b></div><div class="sm">${esc(f.text)}</div></div>`).join('') : `<p class="mute">${t('No items.', 'কোনো আইটেম নেই।')}</p>`;

/* ----- demo-user ----- */
async function demoUser() {
  await C.loadAll(); C.initShell();
  const draw = () => {
    const ps = C.unionProjects('ashulia'), f = findings().filter(x => x.p.union === 'ashulia'), reps = store.get('reports', []);
    root.innerHTML = `<div class="hero"><span class="pill ok">${t('Demo session (no login)', 'ডেমো সেশন (লগইন নেই)')}</span><h1 style="margin-top:6px">Demo Citizen</h1><p>${t('Resident of Ashulia Union, Savar, Dhaka. Synthetic persona.', 'আশুলিয়া ইউনিয়ন, সাভার, ঢাকার বাসিন্দা। কৃত্রিম পারসোনা।')}</p><p><a class="btn pri" href="../app/">${t('Open full dashboard', 'পূর্ণ ড্যাশবোর্ড খুলুন')}</a></p></div>
    <h2 style="margin-top:16px">${t('Nearby alerts', 'কাছাকাছি সতর্কতা')} (${fmt(f.length)})</h2><div class="grid g2">${alertsHTML(f)}</div>
    <h2 style="margin-top:16px">${t('Projects in your union', 'আপনার ইউনিয়নের প্রকল্প')}</h2><div class="grid g2">${ps.map(p => { const a = C.auditProject(p); return `<div class="card"><b>${esc(nm(p))}</b><div class="bar"><i style="width:${a.prog}%"></i></div><div class="sm">${fmt(a.prog, 1)}%</div></div>`; }).join('')}</div>
    <h2 style="margin-top:16px">${t('Report a problem anonymously (demo)', 'বেনামে সমস্যা জানান (ডেমো)')}</h2>
    <form class="card" id="rf"><div class="grid g2"><label class="f">${t('Project', 'প্রকল্প')}<select id="rp">${ps.map(p => `<option value="${esc(p.id)}">${esc(nm(p))}</option>`).join('')}</select></label><label class="f">${t('Issue type', 'সমস্যার ধরন')}<select id="rt"><option value="quality">${t('Material quality', 'উপকরণের মান')}</option><option value="nowork">${t('No work at site', 'সাইটে কাজ নেই')}</option><option value="price">${t('Price concern', 'মূল্য নিয়ে উদ্বেগ')}</option></select></label></div>
    <label class="f" style="margin-top:8px">${t('What did you see?', 'আপনি কী দেখেছেন?')}<textarea id="rd" rows="3" maxlength="500"></textarea></label><div class="row" style="margin-top:8px"><button class="btn pri" type="submit">${t('Save report', 'রিপোর্ট সংরক্ষণ')}</button><span class="sm mute">${t('Saved locally in demo; not transmitted.', 'ডেমোতে লোকালি সংরক্ষিত; কোথাও পাঠানো হয় না।')}</span></div></form>
    <h3 style="margin-top:12px">${t('Your saved reports', 'আপনার সংরক্ষিত রিপোর্ট')} (${fmt(reps.length)})</h3>${reps.map(r => `<div class="card sm"><b>${esc(r.id)}</b> · ${esc(r.project)} · ${esc(r.type)} · ${pill('info', t('Saved locally in demo; not transmitted', 'ডেমোতে লোকালি সংরক্ষিত; পাঠানো হয়নি'))}<div>${esc(r.text)}</div></div>`).join('') || `<p class="mute">${t('None yet.', 'এখনো নেই।')}</p>`}`;
  };
  draw(); C.onLang(draw);
  root.addEventListener('submit', e => { e.preventDefault(); const txt = $('#rd').value.trim(); if (txt.length < 8) { C.toast(t('Please write at least a few words.', 'অন্তত কয়েকটি শব্দ লিখুন।')); return; } const id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)); const l = store.get('reports', []); l.unshift({ id, project: $('#rp').value, type: $('#rt').value, text: txt, at: new Date().toISOString() }); store.set('reports', l); draw(); C.toast(t('Report saved locally.', 'রিপোর্ট লোকালি সংরক্ষিত।')); });
}

/* ----- demo-admin ----- */
async function demoAdmin() {
  await C.loadAll(); C.initShell(); let scan = null;
  const draw = () => {
    const logs = C.allProjects().flatMap(p => p.logs.map(l => ({ p, l }))), ap = store.get('approvals', {}), es = store.get('escalations', {}), f = findings(), reps = store.get('reports', []);
    const approved = logs.filter(x => ap[x.l.id]).length, esc_n = Object.keys(es).length;
    root.innerHTML = `<div class="hero"><span class="pill ok">${t('Demo session (no login)', 'ডেমো সেশন (লগইন নেই)')}</span><h1 style="margin-top:6px">${t('Demo Auditor', 'ডেমো অডিটর')}</h1><p>${t('All actions are saved only in this browser.', 'সব অ্যাকশন শুধু এই ব্রাউজারে সংরক্ষিত।')}</p></div>
    <div class="grid g4" style="margin:12px 0"><div class="card"><div class="sm mute">${t('Logs awaiting approval', 'অনুমোদনের অপেক্ষায়')}</div><div class="big" id="c1">${fmt(logs.length - approved)}</div></div><div class="card"><div class="sm mute">${t('Approved', 'অনুমোদিত')}</div><div class="big" id="c2">${fmt(approved)}</div></div><div class="card"><div class="sm mute">${t('Escalated', 'এস্কেলেটেড')}</div><div class="big" id="c3">${fmt(esc_n)}</div></div><div class="card"><div class="sm mute">${t('Local citizen reports', 'লোকাল নাগরিক রিপোর্ট')}</div><div class="big">${fmt(reps.length)}</div></div></div>
    <div class="card"><div class="row"><h2>${t('Run audit scan', 'অডিট স্ক্যান চালান')}</h2><button class="btn pri" data-a="scan">${t('Run audit scan', 'অডিট স্ক্যান চালান')}</button></div>${scan ? `<p class="sm mute">${scan.at} · ${t('scanned ' + scan.n + ' projects, ' + scan.list.length + ' findings', fmt(scan.n) + 'টি প্রকল্প স্ক্যান, ' + fmt(scan.list.length) + 'টি ফলাফল')}</p><div class="tw"><table><thead><tr><th>${t('Project', 'প্রকল্প')}</th><th>${t('Finding', 'ফলাফল')}</th></tr></thead><tbody>${scan.list.map(x => `<tr><td>${esc(x.p.id)}</td><td>${pill(x.kind, x.text)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="mute">${t('Recomputes price anomalies and disbursement flags across all seed projects.', 'সব সিড প্রকল্পে মূল্য অসঙ্গতি ও ছাড় ফ্ল্যাগ পুনরায় গণনা করে।')}</p>`}</div>
    <div class="card" style="margin-top:12px"><h2>${t('Log approval queue', 'লগ অনুমোদন কিউ')}</h2><div class="tw"><table><thead><tr><th>${t('Project', 'প্রকল্প')}</th><th>${t('Date', 'তারিখ')}</th><th>${t('Log', 'লগ')}</th><th></th></tr></thead><tbody>${logs.map(x => `<tr><td>${esc(x.p.id)}</td><td>${dig(x.l.d)}</td><td>${esc(nm(x.l))}</td><td><button class="btn ${ap[x.l.id] ? 'on' : ''}" data-a="ap" data-id="${esc(x.l.id)}" aria-pressed="${!!ap[x.l.id]}">${ap[x.l.id] ? '✔ ' + t('Approved', 'অনুমোদিত') : t('Approve', 'অনুমোদন')}</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:12px"><h2>${t('Anomaly escalation list', 'অসঙ্গতি এস্কেলেশন তালিকা')}</h2><div class="tw"><table><thead><tr><th>${t('Project', 'প্রকল্প')}</th><th>${t('Finding', 'ফলাফল')}</th><th></th></tr></thead><tbody>${f.map(x => `<tr><td>${esc(x.p.id)}</td><td>${pill(x.kind, x.text)}</td><td><button class="btn ${es[x.id] ? 'on' : ''}" data-a="es" data-id="${esc(x.id)}" aria-pressed="${!!es[x.id]}">${es[x.id] ? '⚑ ' + t('Escalated (local)', 'এস্কেলেটেড (লোকাল)') : t('Mark for escalation', 'এস্কেলেশনের জন্য চিহ্নিত')}</button></td></tr>`).join('')}</tbody></table></div><p class="sm mute">${t('Escalation is a local mark. Nothing is sent to any agency.', 'এস্কেলেশন লোকাল চিহ্ন মাত্র। কোনো সংস্থায় কিছু পাঠানো হয় না।')}</p></div>`;
  };
  draw(); C.onLang(draw);
  C.delegate(root, 'click', '[data-a]', b => {
    const a = b.dataset.a;
    if (a === 'scan') { scan = { at: new Date().toLocaleString(), n: C.allProjects().length, list: findings() }; }
    if (a === 'ap') { const o = store.get('approvals', {}); o[b.dataset.id] ? delete o[b.dataset.id] : o[b.dataset.id] = true; store.set('approvals', o); }
    if (a === 'es') { const o = store.get('escalations', {}); o[b.dataset.id] ? delete o[b.dataset.id] : o[b.dataset.id] = true; store.set('escalations', o); }
    draw();
  });
}

/* ----- admin ----- */
const USERS0 = [['Demo Supervisor', 'Site Supervisor'], ['Demo Director', 'Project Director'], ['Demo Auditor', 'Auditor'], ['Demo UP Secretary', 'Union Overseer']];
async function admin() {
  await C.loadAll(); C.initShell();
  const draw = () => {
    const users = store.get('users', USERS0.map(u => ({ n: u[0], r: u[1], on: true }))), wl = store.get('watch', {}), rt = C.rates(), ov = C.rateOverrides(), fl = C.flags();
    const nf = allAudits().reduce((s, x) => s + x.a.flagged, 0);
    root.innerHTML = `<div class="card" style="border-color:var(--amber)"><b>${t('Demo only. There is no real authentication.', 'শুধু ডেমো। কোনো প্রকৃত প্রমাণীকরণ নেই।')}</b> ${t('Planned: SSO and 2FA.', 'পরিকল্পিত: এসএসও ও টুএফএ।')} <span class="tag planned">${t('Planned', 'পরিকল্পিত')}</span></div>
    <h2 style="margin-top:14px">${t('Users and roles (local demo list)', 'ইউজার ও ভূমিকা (লোকাল ডেমো তালিকা)')}</h2><div class="tw"><table><thead><tr><th>${t('User', 'ইউজার')}</th><th>${t('Role', 'ভূমিকা')}</th><th>${t('Active', 'সক্রিয়')}</th></tr></thead><tbody>${users.map((u, i) => `<tr><td>${esc(u.n)}</td><td><select data-u="${i}" aria-label="${esc(u.n)} role">${['Site Supervisor', 'Project Director', 'Auditor', 'Union Overseer', 'Citizen'].map(r => `<option${r === u.r ? ' selected' : ''}>${r}</option>`).join('')}</select></td><td><button class="btn ${u.on ? 'on' : ''}" data-ut="${i}" aria-pressed="${u.on}">${u.on ? t('Active', 'সক্রিয়') : t('Disabled', 'নিষ্ক্রিয়')}</button></td></tr>`).join('')}</tbody></table></div>
    <h2 style="margin-top:14px">${t('Contractor watchlist', 'ঠিকাদার ওয়াচলিস্ট')}</h2><p class="sm mute">${t('A watchlist is a prompt for human review, not a penalty. Humans decide.', 'ওয়াচলিস্ট মানুষের পর্যালোচনার ইঙ্গিত, শাস্তি নয়। সিদ্ধান্ত মানুষের।')}</p><div class="tw"><table><tbody>${Object.entries(D.contractors).map(([k, c]) => `<tr><td>${esc(nm(c))}</td><td>${t('prior delays', 'আগের বিলম্ব')} ${fmt(c.priorDelays)}</td><td><button class="btn ${wl[k] ? 'on' : ''}" data-w="${k}" aria-pressed="${!!wl[k]}">${wl[k] ? t('On watchlist', 'ওয়াচলিস্টে') : t('Add to watchlist', 'ওয়াচলিস্টে যোগ')}</button></td></tr>`).join('')}</tbody></table></div>
    <h2 style="margin-top:14px">${t('Benchmark rates (editable)', 'বেঞ্চমার্ক রেট (সম্পাদনযোগ্য)')}</h2><p class="sm">${t('Items flagged right now: ', 'এখন ফ্ল্যাগকৃত আইটেম: ')}<b id="nf">${fmt(nf)}</b> · ${t('edits recompute badges across the app.', 'পরিবর্তনে পুরো অ্যাপের ব্যাজ পুনরায় গণনা হয়।')}</p>
    <div class="tw"><table><thead><tr><th>${t('Material', 'উপকরণ')}</th><th>${t('Unit', 'একক')}</th><th class="n">${t('Default', 'ডিফল্ট')}</th><th class="n">${t('Current ৳', 'বর্তমান ৳')}</th></tr></thead><tbody>${Object.entries(D.benchmarks.materials).map(([k, m]) => `<tr><td>${esc(nm(m))}</td><td>${esc(m.unit)}</td><td class="n">${fmt(D.baseRates[k], 2)}</td><td class="n"><input type="number" step="0.01" min="0.01" data-r="${k}" value="${rt[k]}" aria-label="${esc(m.en)}" style="width:110px;text-align:right">${ov[k] !== undefined ? ' ' + pill('info', t('edited', 'সম্পাদিত')) : ''}</td></tr>`).join('')}</tbody></table></div><button class="btn" data-a="reset" style="margin-top:8px">${t('Reset all rates', 'সব রেট রিসেট')}</button>
    <h2 style="margin-top:14px">${t('Feature toggles', 'ফিচার টগল')}</h2><div class="row">${[['projection', 'Next-day projection', 'পরবর্তী দিনের প্রক্ষেপণ'], ['copilot', 'Retrieval copilot', 'রিট্রিভাল কোপাইলট']].map(x => `<button class="btn ${fl[x[0]] ? 'on' : ''}" data-f="${x[0]}" aria-pressed="${fl[x[0]]}">${t(x[1], x[2])}: ${fl[x[0]] ? t('enabled', 'চালু') : t('disabled', 'বন্ধ')}</button>`).join('')}</div><p class="sm mute">${t('These really switch the features off in /app.', 'এগুলো /app এ ফিচার সত্যিই বন্ধ করে।')}</p>`;
  };
  draw(); C.onLang(draw);
  const upd = f => { const u = store.get('users', USERS0.map(x => ({ n: x[0], r: x[1], on: true }))); f(u); store.set('users', u); draw(); };
  root.addEventListener('change', e => {
    if (e.target.dataset.u !== undefined) upd(u => u[+e.target.dataset.u].r = e.target.value);
    if (e.target.dataset.r) { const v = parseFloat(e.target.value); if (!(v > 0) || !isFinite(v)) { C.toast(t('Enter a positive number.', 'ধনাত্মক সংখ্যা দিন।')); draw(); return; } C.setRate(e.target.dataset.r, v); draw(); C.toast(t('Rate saved. Badges recomputed.', 'রেট সংরক্ষিত। ব্যাজ পুনরায় গণনা হয়েছে।')); }
  });
  C.delegate(root, 'click', 'button', b => {
    if (b.dataset.ut !== undefined) upd(u => u[+b.dataset.ut].on = !u[+b.dataset.ut].on);
    if (b.dataset.w) { const w = store.get('watch', {}); w[b.dataset.w] ? delete w[b.dataset.w] : w[b.dataset.w] = true; store.set('watch', w); draw(); }
    if (b.dataset.a === 'reset') { C.resetRates(); draw(); }
    if (b.dataset.f) { const f = C.flags(); f[b.dataset.f] = !f[b.dataset.f]; store.set('flags', f); draw(); }
  });
}
const run = { 'demo-user': demoUser, 'demo-admin': demoAdmin, admin }[pg];
if (run) run().catch(e => { root.innerHTML = `<div class="card">${esc(e.message)}</div>`; });
