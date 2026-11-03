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
      if (!reduce) {
        // Restart the shadow that follows the turn (Version 24).
        flip.classList.remove('turning');
        void flip.offsetWidth;
        flip.classList.add('turning');
        window.clearTimeout(flip.turnTimer);
        flip.turnTimer = window.setTimeout(function () { flip.classList.remove('turning'); }, 750);
      }
    });
  });

  // 3. Buttons press in when tapped (Version 24). Phones only show the pressed
  //    look while a touch listener exists, so this one does nothing else.
  document.addEventListener('touchstart', function () {}, { passive: true });

  // 4. A "New" label on Updates items from the last 30 days (Version 24).
  //    Each item carries its date as data-date="YYYY-MM-DD"; items without one never get the label.
  var now = Date.now();
  var dated = document.querySelectorAll('[data-date]');
  Array.prototype.forEach.call(dated, function (item) {
    var parts = item.getAttribute('data-date').split('-');
    var when = new Date(+parts[0], +parts[1] - 1, +parts[2]).getTime();
    var days = (now - when) / 86400000;
    var meta = item.querySelector('.book-meta');
    if (meta && days >= 0 && days < 30) {
      var mark = document.createElement('span');
      mark.className = 'new-mark';
      mark.textContent = 'New';
      meta.appendChild(mark);
    }
  });

  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');

  // 5. Sections fade and rise in once, the first time they scroll into view (Version 17).
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

  // 6. The Restless Tails reading-order line draws itself in once (Version 21).
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
