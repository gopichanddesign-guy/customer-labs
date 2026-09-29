// Book a Demo flow: open modal → validate details → show confirmation.
(function () {
  const modal = document.getElementById('demo-modal');
  const form = document.getElementById('demo-form');
  const success = document.getElementById('demo-success');
  const addCal = document.getElementById('add-cal');
  let lastFocus = null;

  function openDemo() {
    lastFocus = document.activeElement;
    form.hidden = false;
    success.hidden = true;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('f-name').focus();
  }

  function closeDemo() {
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
    input.addEventListener('blur', () => input.value && check(id));
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
