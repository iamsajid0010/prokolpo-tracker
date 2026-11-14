import * as C from './core.js';
const { t, $, $$, store } = C;
C.initShell();
// network backdrop: deterministic node positions, lines draw in, nodes pulse (CSS only)
const net = $('#net'), pts = [[8, 22], [22, 60], [18, 86], [38, 30], [50, 70], [62, 24], [74, 58], [88, 18], [92, 80], [40, 92], [70, 90], [30, 8]], links = [[0, 1], [1, 2], [0, 3], [3, 4], [3, 5], [5, 6], [6, 7], [6, 8], [4, 9], [4, 10], [10, 8], [1, 4], [11, 3], [5, 7]];
net.innerHTML = links.map(([a, b], i) => `<line x1="${pts[a][0]}%" y1="${pts[a][1]}%" x2="${pts[b][0]}%" y2="${pts[b][1]}%" style="animation-delay:${(i * 0.12).toFixed(2)}s"/>`).join('') + pts.map((p, i) => `<circle cx="${p[0]}%" cy="${p[1]}%" r="3" style="animation-delay:${(i * 0.3).toFixed(1)}s"/>`).join('');
// title letters
const h = $('#ttl'); const draw = () => { const txt = t('Prokolpo Tracker', 'প্রকল্প ট্র্যাকার'); h.setAttribute('aria-label', txt); h.innerHTML = txt.split(' ').map((w, i) => `<span class="l" aria-hidden="true" style="animation-delay:${(0.5 + i * 0.25).toFixed(2)}s">${w}</span>`).join(' '); };
draw(); C.onLang(draw);
// count-up stats
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
$$('[data-n]').forEach(el => { const n = +el.dataset.n; if (reduce) { el.textContent = C.dig(n); return; } const t0 = performance.now() + 1700; const step = now => { const k = Math.min(1, Math.max(0, (now - t0) / 1200)); el.textContent = C.dig(Math.round(n * k)); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
C.onLang(() => $$('[data-n]').forEach(el => el.textContent = C.dig(el.dataset.n)));
// auto-continue with a pause control (WCAG 2.2.2); never auto-advances with reduced motion
const bar = $('#prog'), pauseBtn = $('#pause'); let timer = null;
const go = () => { location.href = 'app/'; };
const start = () => { bar.classList.add('run'); timer = setTimeout(go, 7000); pauseBtn.setAttribute('aria-pressed', 'false'); pauseBtn.textContent = t('Stay on this page', 'এই পেজে থাকুন'); };
const stop = () => { clearTimeout(timer); timer = null; bar.classList.remove('run'); bar.querySelector('i').style.width = '0'; pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.textContent = t('Auto-continue paused', 'স্বয়ংক্রিয় চালু বিরতিতে'); };
if (reduce) { bar.hidden = true; pauseBtn.hidden = true; } else { start(); pauseBtn.addEventListener('click', () => timer ? stop() : start()); document.addEventListener('keydown', e => { if (e.key === 'Escape' && timer) stop(); }); C.onLang(() => timer ? start.call(null, clearTimeout(timer)) : stop()); }
$('#enter').focus({ preventScroll: true });
