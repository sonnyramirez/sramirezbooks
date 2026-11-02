// Fades each section in the first time it scrolls into view.
// Does nothing when the visitor has asked their device for reduced motion,
// and nothing is hidden unless this script runs.
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var items = document.querySelectorAll('main > .section, main > .page-hero');
  var root = document.documentElement;
  root.classList.add('motion');

  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        seen.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(function (el) {
    var box = el.getBoundingClientRect();
    if (box.top < window.innerHeight) {
      el.classList.add('in-view');
    } else {
      el.classList.add('reveal');
      seen.observe(el);
    }
  });
})();
