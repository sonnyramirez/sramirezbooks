// Motion and reading helpers for sramirezbooks.com.
// Anything that moves on its own is skipped when the visitor has asked their
// device for reduced motion, and nothing is hidden unless this script runs.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // 1. Reading progress bar on the sample pages (Version 21).
  //    It only moves when the reader scrolls, so it stays on for everyone.
  var sample = document.querySelector('.sample-text');
  if (sample) {
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(document.createElement('span'));
    document.body.appendChild(bar);
    var fill = bar.firstChild;
    var queued = false;
    var update = function () {
      queued = false;
      var box = sample.getBoundingClientRect();
      var done = (window.innerHeight - box.top) / box.height;
      done = Math.max(0, Math.min(1, done));
      fill.style.transform = 'scaleX(' + done + ')';
    };
    var request = function () {
      if (!queued) { queued = true; window.requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  // 2. "See the back cover" button on book pages that have a back cover (Version 21).
  var flips = document.querySelectorAll('.flip');
  Array.prototype.forEach.call(flips, function (flip) {
    var button = flip.parentNode.querySelector('.flip-toggle');
    if (!button) return;
    button.hidden = false;
    button.addEventListener('click', function () {
      var turned = flip.classList.toggle('flipped');
      button.setAttribute('aria-pressed', turned ? 'true' : 'false');
      button.textContent = turned ? 'See the front cover' : 'See the back cover';
    });
  });

  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');

  // 3. Sections fade and rise in once, the first time they scroll into view (Version 17).
  var items = document.querySelectorAll('main > .section, main > .page-hero');
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        seen.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  items.forEach(function (el) {
    var box = el.getBoundingClientRect();
    if (box.top < window.innerHeight) {
      el.classList.add('in-view');
    } else {
      el.classList.add('reveal');
      seen.observe(el);
    }
  });

  // 4. The Restless Tails reading-order line draws itself in once (Version 21).
  var orders = document.querySelectorAll('.reading-order');
  var drawn = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        drawn.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  Array.prototype.forEach.call(orders, function (el) {
    el.classList.add('to-draw');
    drawn.observe(el);
  });
})();
