// Book a Demo flow: open modal → validate details → show confirmation.
(function () {
  const modal = document.getElementById('demo-modal');
  const form = document.getElementById('demo-form');
  const success = document.getElementById('demo-success');
  const addCal = document.getElementById('add-cal');
  let lastFocus = null;

  function openDemo() {
    lastFocus = document.activeElement;
    resetForm();
    form.hidden = false;
    success.hidden = true;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('f-name').focus();
  }

  // Clear typed values and error messages so the form always opens fresh.
  function resetForm() {
    form.reset();
    form.querySelectorAll('.field').forEach((field) => {
      field.classList.remove('has-error');
      const err = field.querySelector('.error');
      if (err) err.textContent = '';
    });
  }

  function closeDemo() {
    resetForm();
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-open-demo]').forEach((el) =>
    el.addEventListener('click', (e) => { e.preventDefault(); openDemo(); })
  );
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-demo]')) closeDemo();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeDemo();
  });

  const rules = {
    'f-name': (v) => (v.trim() ? '' : 'Enter your first name.'),
    'f-email': (v) => {
      if (!v.trim()) return 'Enter your work email.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email like you@company.com.';
    },
    'f-site': (v) => {
      if (!v.trim()) return 'Enter your company website.';
      return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v.trim()) ? '' : 'Enter a website like company.com.';
    },
    'f-role': (v) => (v ? '' : 'Select your role.'),
  };

  function check(id) {
    const input = document.getElementById(id);
    const field = input.closest('.field');
    const msg = rules[id](input.value);
    field.classList.toggle('has-error', !!msg);
    field.querySelector('.error').textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => !modal.hidden && input.value && check(id));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) check(id);
    });
    input.addEventListener('change', () => check(id));
  });

  // Next weekday slot, two business days out, 10:00–10:30 AM Pacific.
  function nextSlot() {
    const d = new Date();
    let added = 0;
    while (added < 2) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) {
      form.querySelector('.has-error input, .has-error select').focus();
      return;
    }

    const day = nextSlot();
    document.getElementById('c-date').textContent = day.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const ymd = `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'CustomerLabs personalized demo',
      dates: `${ymd}T100000/${ymd}T103000`,
      ctz: 'America/Los_Angeles',
      details: '30-minute personalized walkthrough of CustomerLabs.',
    });
    addCal.href = `https://calendar.google.com/calendar/render?${params}`;

    form.hidden = true;
    success.hidden = false;
    success.querySelector('.icon-btn').focus();
    form.reset();
  });
})();

// Motion layer: hero video, marquee, card spotlight, count-ups, scroll reveals.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero video: fades to the Figma's 60% opacity once real frames play;
  // the poster (a render of the Figma frame) shows until then.
  const video = document.querySelector('.hero-video');
  if (video) {
    video.addEventListener('playing', () => {
      video.classList.add('is-playing');
      video.closest('.hero').classList.add('has-video');
    });
    if (reduce) video.removeAttribute('autoplay'), video.pause();
  }

  // Client logos: duplicate once and scroll as an endless marquee.
  const row = document.querySelector('.logo-row');
  if (row && !reduce) {
    const track = document.createElement('div');
    track.className = 'logo-track';
    const logos = [...row.children];
    logos.forEach((img) => track.appendChild(img));
    logos.forEach((img) => {
      const copy = img.cloneNode(true);
      copy.alt = '';
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
    row.appendChild(track);
    row.classList.add('is-marquee');
  }

  // Spotlight follows the pointer across cards.
  document.querySelectorAll('.feature-card, .t-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Count numbers up from zero the first time they scroll into view,
  // and again whenever a testimonial card is hovered.
  function countUp(el) {
    if (reduce || el.dataset.running) return;
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    el.dataset.running = '1';
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else { el.textContent = el.dataset.count + suffix; delete el.dataset.running; }
    }
    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll('[data-count]');
  document.querySelectorAll('.t-card').forEach((card) => {
    const n = card.querySelector('[data-count]');
    if (n) card.addEventListener('mouseenter', () => countUp(n));
  });

  if (!('IntersectionObserver' in window) || reduce) return;

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { countUp(e.target); countObs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countObs.observe(el));

  // Scroll reveal, applied only to things still below the fold at load,
  // so the first screen is always complete.
  const targets = document.querySelectorAll(
    '.trust-title, .section-head, .results .section-copy, .feature-card, .t-card, .grid-footer, .cta-copy'
  );
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal-pre'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 3) * 90}ms`;
      el.classList.add('reveal-in');
      el.classList.remove('reveal-pre');
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; el.classList.remove('reveal-in'); }, { once: true });
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('reveal-pre');
      revealObs.observe(el);
    }
  });
  // Safety net: never leave anything hidden.
  setTimeout(() => document.querySelectorAll('.reveal-pre').forEach((el) => el.classList.remove('reveal-pre')), 8000);
})();
