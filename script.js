'use strict';

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('js-ready');
}

document.getElementById('year').textContent = new Date().getFullYear();

// Tiny live app demo. All state stays in memory.
const habits = [...document.querySelectorAll('.habit')];
habits.forEach(habit => {
  habit.addEventListener('click', () => {
    habit.setAttribute('aria-pressed', String(habit.getAttribute('aria-pressed') !== 'true'));
    const completed = habits.filter(item => item.getAttribute('aria-pressed') === 'true').length;
    document.getElementById('habitStatus').textContent = completed === 3 ? 'Så där ja. Tre små vinster!' : `${completed} av 3 små steg`;
    document.getElementById('habitPercent').textContent = `${Math.round(completed / 3 * 100)} %`;
    document.getElementById('habitProgress').style.width = `${completed / 3 * 100}%`;
  });
});

// A quiet, grammatical app/game flip. Keep the accessible heading stable.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroPhrase = document.getElementById('heroPhrase');
const heroLead = document.getElementById('heroLead');
const heroWord = document.getElementById('heroWord');
let heroGame = false;
window.setInterval(() => {
  if (document.hidden || motionPreference.matches) return;
  heroPhrase.classList.add('is-turning');
  window.setTimeout(() => {
    if (motionPreference.matches) {
      heroPhrase.classList.remove('is-turning');
      return;
    }
    heroGame = !heroGame;
    heroLead.textContent = heroGame ? 'Ditt första ' : 'Din första ';
    heroWord.textContent = heroGame ? 'spel.' : 'app.';
    heroPhrase.classList.remove('is-turning');
  }, 220);
}, 4500);

// Cal.com follows the existing EUC Stockholm B2C flow, but uses separate
// 120-minute online group events. No EUC event is ever used as a fallback.
const booking = window.ZENTO_BOOKING;
const bookingDialog = document.getElementById('bookingDialog');
const bookingPending = document.getElementById('bookingPending');
const bookingLive = document.getElementById('bookingLive');
const calEmbed = document.getElementById('calEmbed');
let activeCalLink = '';
let calLoadPromise;

function isCalPath(value) {
  return typeof value === 'string' && /^[a-z0-9_-]+\/[a-z0-9_-]+$/i.test(value);
}

function loadCal(namespace) {
  if (calLoadPromise) return calLoadPromise;
  calLoadPromise = new Promise((resolve, reject) => {
    // Official queued embed bootstrap, matching the existing booking site.
    (function (C, A, L) {
      const push = (api, args) => api.q.push(args);
      C.Cal = C.Cal || function () {
        const cal = C.Cal;
        const args = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; cal.loaded = true; }
        if (args[0] === L) {
          const api = function () { push(api, arguments); };
          const namespace = args[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            push(cal.ns[namespace], args);
            push(cal, ['initNamespace', namespace]);
          } else push(cal, args);
          return;
        }
        push(cal, args);
      };
    })(window, null, 'init');
    window.Cal('init', namespace, { origin: booking.origin });
    const script = document.createElement('script');
    script.src = `${booking.origin}/embed/embed.js`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      calLoadPromise = undefined;
      reject(new Error('Kalendern kunde inte laddas.'));
    };
    document.head.appendChild(script);
  });
  return calLoadPromise;
}

function mountCalendar(calLink) {
  if (activeCalLink === calLink) return;
  activeCalLink = calLink;
  calEmbed.replaceChildren();
  const loading = document.createElement('p');
  loading.textContent = 'Laddar lediga kurstillfällen…';
  loading.setAttribute('role', 'status');
  calEmbed.append(loading);
  const namespace = calLink.split('/')[1];
  loadCal(namespace).then(() => {
    if (activeCalLink !== calLink) return;
    calEmbed.replaceChildren();
    if (!window.Cal.ns[namespace]) window.Cal('init', namespace, { origin: booking.origin });
    window.Cal.config = window.Cal.config || {};
    window.Cal.config.forwardQueryParams = true;
    window.Cal.ns[namespace]('inline', {
      elementOrSelector: '#calEmbed',
      calLink,
      config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true', timeFormat: '24h', theme: 'light' }
    });
    window.Cal.ns[namespace]('ui', { hideEventTypeDetails: false, layout: 'month_view' });
  }).catch(() => {
    if (activeCalLink !== calLink) return;
    activeCalLink = '';
    loading.textContent = 'Kalendern kunde inte laddas. Öppna bokningen i en ny flik via länken nedan.';
  });
}

function openBooking(courseId) {
  const course = booking.courses[courseId];
  if (!course) return;
  document.getElementById('bookingTitle').textContent = course.title;
  const available = isCalPath(course.calLink);
  bookingPending.hidden = available;
  bookingLive.hidden = !available;
  const subject = `Intresse: ${course.title.replace(/\.$/, '')} – Zento`;
  const body = `Hej Peter!\n\nJag är intresserad av kursen ”${course.title}” online till pilotpriset 399 kr. Hör gärna av dig om kommande kurstillfällen.\n\nHälsningar,\n`;
  document.getElementById('interestLink').href = `mailto:${booking.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (!available) activeCalLink = '';
  bookingDialog.showModal();
  document.getElementById('bookingClose').focus();
  if (available) {
    document.getElementById('calExternal').href = `${booking.origin}/${course.calLink}`;
    mountCalendar(course.calLink);
  }
}

document.querySelectorAll('[data-book]').forEach(button => {
  button.addEventListener('click', () => openBooking(button.dataset.book));
});

function setupDialog(dialog, closeId) {
  document.getElementById(closeId).addEventListener('click', () => dialog.close());
  // Native dialog supplies Escape handling, focus trapping and focus return.
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
}
setupDialog(bookingDialog, 'bookingClose');
const privacyDialog = document.getElementById('privacyDialog');
setupDialog(privacyDialog, 'privacyClose');
document.getElementById('privacyOpen').addEventListener('click', () => privacyDialog.showModal());
