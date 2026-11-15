/* Performance helper. No visual change:
   1) marks the page "settled" after the entrance animations so re-rendered cards don't replay them
   2) pauses infinite decorative animations while they are off-screen (they resume when scrolled back) */
(function () {
  try {
    var root = document.documentElement;
    setTimeout(function () { root.classList.add('settled'); }, 1600);
    if (!('IntersectionObserver' in window)) return;
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('perf-off', !e.isIntersecting); });
    }, { rootMargin: '120px' });
    function watch(el) { if (!seen.has(el)) { seen.add(el); io.observe(el); } }
    function scan() {
      document.querySelectorAll('.bd-hero,.bd-portal-hero,.hero-scenery-svg,.bd-kpi,.bd-stamp,.bd-hero-art,.bar,svg').forEach(function (el) {
        if (seen.has(el)) return;
        var hit = el.matches('.bd-hero,.bd-portal-hero,.hero-scenery-svg,.bd-kpi,.bar') || /infinite/.test(getComputedStyle(el).animationIterationCount);
        if (hit) watch(el);
      });
    }
    var t = null;
    function later() { clearTimeout(t); t = setTimeout(function () { (window.requestIdleCallback || setTimeout)(scan); }, 250); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
    new MutationObserver(later).observe(document.body || root, { childList: true, subtree: true });
  } catch (e) { /* performance helper must never break the page */ }
})();
