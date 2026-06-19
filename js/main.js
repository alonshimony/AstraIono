/* ============================================================
   ASTRA IONO — interactions & cinematic motion
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro veil ---------- */
  const veil = document.getElementById('introVeil');
  if (veil) {
    const hide = () => veil.classList.add('is-gone');
    if (prefersReduced) { hide(); }
    else { window.setTimeout(hide, 2300); }
    // Safety: never trap the page.
    window.addEventListener('load', () => window.setTimeout(hide, 2600), { once: true });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Parallax gallery ---------- */
  const parallaxEls = Array.from(document.querySelectorAll('[data-depth]'));
  if (parallaxEls.length && !prefersReduced) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const depth = parseFloat(el.getAttribute('data-depth')) || 0.1;
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.setProperty('--py', `${(-center * depth).toFixed(1)}px`);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Lazy Spotify embeds ---------- */
  document.querySelectorAll('.song-card[data-spotify]').forEach((card) => {
    const id = card.getAttribute('data-spotify');
    const slot = card.querySelector('[data-embed]');
    if (id && slot) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://open.spotify.com/embed/track/${id}?utm_source=astraiono`;
      iframe.width = '100%';
      iframe.height = '152';
      iframe.loading = 'lazy';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.setAttribute('title', 'Spotify player');
      slot.appendChild(iframe);
      const wave = card.querySelector('.song-card__wave');
      if (wave) wave.style.display = 'none';
    }
  });

  /* ---------- Lazy YouTube: featured + tiles ---------- */
  const featured = document.querySelector('.feature-video[data-yt]');
  if (featured) {
    const id = featured.getAttribute('data-yt');
    const frame = featured.querySelector('[data-embed]');
    const playBtn = featured.querySelector('.feature-video__play');
    if (id && frame && playBtn) {
      playBtn.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.setAttribute('title', 'Featured video');
        frame.appendChild(iframe);
        featured.classList.add('is-playing');
      }, { once: true });
    } else if (playBtn && !id) {
      // No real ID yet — let the button fall through to the YouTube channel link.
      playBtn.addEventListener('click', () => window.open('https://youtube.com', '_blank', 'noopener'));
    }
  }

  /* ---------- Newsletter (front-end stub) ---------- */
  const form = document.getElementById('signupForm');
  if (form) {
    const note = document.getElementById('signupNote');
    const input = document.getElementById('signupEmail');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (input.value || '').trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        note.textContent = 'Please enter a valid email address.';
        note.style.color = '#ff7aa8';
        input.focus();
        return;
      }
      // TODO: connect to a provider (Mailchimp / ConvertKit / custom endpoint).
      note.textContent = 'You’re on the frequency. Watch your inbox for the next transmission.';
      note.style.color = '';
      form.reset();
    });
  }

  /* ---------- Particle field ---------- */
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let raf = null;
    const COLORS = ['rgba(63,214,255,', 'rgba(154,240,255,', 'rgba(123,92,255,', 'rgba(255,91,192,'];

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(120, Math.floor((w * h) / 14000));
      particles = [];
      for (let i = 0; i < target; i++) particles.push(makeParticle());
    }

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.28 + 0.06),
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.fillStyle = p.c + alpha.toFixed(3) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(tick);
    }

    function start() { if (!raf) tick(); }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = null; } }

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

    resize();
    start();
  }
})();
