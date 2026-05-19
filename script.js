/* ============================================
   HK CONCEPT v2 — script.js
   FORMD Agency
   ============================================ */

'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ============================================
   CURSOR
   ============================================ */
(function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || window.innerWidth <= 768) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
  });

  (function animate() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animate);
  })();
})();

/* ============================================
   NAV SCROLL
   ============================================ */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ============================================
   HAMBURGER
   ============================================ */
(function initMenu() {
  const btn  = $('#hamburger');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  const close = () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const open = menu.classList.contains('open');
    if (open) { close(); return; }
    btn.classList.add('open');
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  $$('.mobile-link, .mobile-cta').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ============================================
   SMOOTH SCROLL
   ============================================ */
(function initScroll() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

/* ============================================
   HERO SLIDESHOW
   ============================================ */
(function initSlideshow() {
  const slides      = $$('.slide');
  const watermark   = $('#slideWatermark');
  const progressFill = $('#progressFill');
  const countEl     = $('#slideCount');
  const prevBtn     = $('#prevSlide');
  const nextBtn     = $('#nextSlide');

  if (!slides.length) return;

  const TOTAL    = slides.length;
  const DURATION = 5000; // ms per slide
  let current    = 0;
  let timer      = null;
  let startTime  = null;
  let rafId      = null;

  const pad = (n) => String(n + 1).padStart(2, '0');

  function goTo(idx) {
    slides[current].classList.remove('active');
    current = (idx + TOTAL) % TOTAL;
    slides[current].classList.add('active');

    if (watermark) watermark.textContent = pad(current);
    if (countEl)   countEl.textContent   = `${pad(current)} / ${pad(TOTAL - 1)}`;

    // Reset progress
    cancelAnimationFrame(rafId);
    clearTimeout(timer);
    startTime = performance.now();
    animateProgress();
  }

  function animateProgress() {
    rafId = requestAnimationFrame((now) => {
      const elapsed  = now - startTime;
      const pct      = Math.min((elapsed / DURATION) * 100, 100);
      if (progressFill) progressFill.style.width = pct + '%';

      if (pct < 100) {
        animateProgress();
      } else {
        goTo(current + 1);
      }
    });
  }

  // Init
  goTo(0);

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Pause on hover
  const hero = $('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    });
    hero.addEventListener('mouseleave', () => {
      startTime = performance.now() - (parseFloat(progressFill?.style.width || 0) / 100) * DURATION;
      animateProgress();
    });
  }

  // Touch swipe
  let touchX = 0;
  const slidesEl = $('.slides');
  if (slidesEl) {
    slidesEl.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    slidesEl.addEventListener('touchend',   (e) => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }
})();

/* ============================================
   SCROLL REVEAL
   ============================================ */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setTimeout(() => el.classList.add('visible'), 100);
    } else {
      obs.observe(el);
    }
  });
})();

/* ============================================
   RUNNING BAND — duplicate
   ============================================ */
(function initBand() {
  const band = $('#bandInner');
  if (!band) return;
  band.innerHTML += band.innerHTML;
})();

/* ============================================
   CONTACT FORM
   ============================================ */
(function initForm() {
  const btn  = $('#submitBtn');
  const text = $('#submitText');
  if (!btn) return;

  const fields = {
    name:    $('#name'),
    email:   $('#email'),
    phone:   $('#phone'),
    service: $('#service'),
    message: $('#message'),
  };

  // Inject error styles
  const style = document.createElement('style');
  style.textContent = `
    .form-input.error { border-color: rgba(192,57,43,0.7) !important; }
    .btn-submit:disabled { cursor: not-allowed; opacity: .7; }
  `;
  document.head.appendChild(style);

  btn.addEventListener('click', () => {
    let valid = true;
    const nameVal  = fields.name?.value.trim();
    const emailVal = fields.email?.value.trim();

    if (!nameVal) { fields.name?.classList.add('error'); valid = false; }
    else           fields.name?.classList.remove('error');

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRx.test(emailVal)) { fields.email?.classList.add('error'); valid = false; }
    else                                         fields.email?.classList.remove('error');

    if (!valid) {
      text.textContent = 'Remplissez les champs requis *';
      setTimeout(() => { text.textContent = 'Envoyer ma demande'; }, 2800);
      return;
    }

    btn.disabled = true;
    btn.classList.add('sent');
    text.textContent = 'Message envoyé ✓';

    setTimeout(() => {
      Object.values(fields).forEach((f) => { if (f) f.value = ''; });
      btn.classList.remove('sent');
      btn.disabled = false;
      text.textContent = 'Envoyer ma demande';
    }, 4000);
  });
})();

/* ============================================
   PARALLAX HERO (desktop)
   ============================================ */
(function initParallax() {
  if (window.innerWidth <= 768) return;
  const activeImg = () => document.querySelector('.slide.active img');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const img = activeImg();
      if (img && y < window.innerHeight) {
        img.style.transform = `scale(1) translateY(${y * 0.08}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();
