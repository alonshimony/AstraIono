/* ============================================================
   ASTRA IONO — interactions & cinematic motion
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Cinematic intro veil ---------- */
  const veil = document.getElementById('introVeil');
  if (veil) {
    const hide = () => veil.classList.add('is-gone');
    if (prefersReduced) { hide(); }
    else { window.setTimeout(hide, 2300); }
    window.addEventListener('load', () => window.setTimeout(hide, 2600), { once: true });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40); };
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

  /* ---------- Waveform bars (injected so HTML stays clean) ---------- */
  document.querySelectorAll('.song-card__wave').forEach((wave) => {
    if (wave.children.length) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 14; i++) frag.appendChild(document.createElement('span'));
    wave.appendChild(frag);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
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

  /* ---------- Lazy Spotify embeds (build on scroll-in) ---------- */
  function buildSpotify(card) {
    const id = card.getAttribute('data-spotify');
    const slot = card.querySelector('[data-embed]');
    if (!id || !slot || slot.dataset.loaded) return;
    slot.dataset.loaded = '1';
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
  const spotifyCards = Array.from(document.querySelectorAll('.song-card[data-spotify]'));
  if (spotifyCards.length) {
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { buildSpotify(e.target); sio.unobserve(e.target); }
        });
      }, { rootMargin: '300px 0px' });
      spotifyCards.forEach((c) => sio.observe(c));
    } else {
      spotifyCards.forEach(buildSpotify);
    }
  }

  /* ---------- Lazy YouTube: featured ---------- */
  const featured = document.querySelector('.feature-video[data-yt]');
  if (featured) {
    const id = featured.getAttribute('data-yt');
    const list = featured.getAttribute('data-list');
    const frame = featured.querySelector('[data-embed]');
    const playBtn = featured.querySelector('.feature-video__play');
    if (id && frame && playBtn) {
      playBtn.addEventListener('click', () => {
        let src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        if (list) src += `&list=${list}`;
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.setAttribute('title', 'Featured video');
        frame.appendChild(iframe);
        featured.classList.add('is-playing');
      }, { once: true });
    } else if (playBtn && !id) {
      playBtn.addEventListener('click', () => window.open('https://www.youtube.com/@AstraIono', '_blank', 'noopener'));
    }
  }

  /* ---------- Video-grid tiles: play inline when they have a real ID ---------- */
  document.querySelectorAll('.video-tile[data-yt]').forEach((tile) => {
    const vid = tile.getAttribute('data-yt');
    if (!vid) return; // empty → leave as a normal link to the channel
    tile.addEventListener('click', (e) => {
      if (tile.dataset.loaded) return;
      e.preventDefault();
      tile.dataset.loaded = '1';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.setAttribute('title', 'Music video');
      tile.appendChild(iframe);
      tile.classList.add('is-playing');
    });
  });

  /* ---------- Newsletter (front-end stub) ---------- */
  const form = document.getElementById('signupForm');
  if (form) {
    const note = document.getElementById('signupNote');
    const input = document.getElementById('signupEmail');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        note.textContent = 'Please enter a valid email address.';
        note.style.color = '#ff7aa8';
        input.focus();
        return;
      }
      note.textContent = 'You’re on the frequency. Watch your inbox for the next transmission.';
      note.style.color = '';
      form.reset();
    });
  }

  /* ============================================================
     CANVAS: ambient particles + periodic "positive" waves
     ============================================================ */
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, particles = [], waves = [], raf = null, nextWaveAt = 0;
    const COLORS = ['rgba(63,214,255,', 'rgba(154,240,255,', 'rgba(123,92,255,', 'rgba(255,91,192,'];
    const WAVE_COLORS = [[120, 220, 255], [150, 130, 255], [255, 120, 200], [255, 190, 120]];

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
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.28 + 0.06),
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }
    function spawnWave() {
      const col = WAVE_COLORS[(Math.random() * WAVE_COLORS.length) | 0];
      waves.push({
        x: w * (0.2 + Math.random() * 0.6),
        y: h * (0.25 + Math.random() * 0.55),
        r: 0,
        max: Math.max(w, h) * (0.45 + Math.random() * 0.35),
        col
      });
    }
    function tick(t) {
      ctx.clearRect(0, 0, w, h);

      // periodic positive waves (gentle expanding rings of light)
      if (!nextWaveAt) nextWaveAt = t + 2500;
      if (t > nextWaveAt) { spawnWave(); nextWaveAt = t + 6500 + Math.random() * 4500; }
      for (let i = waves.length - 1; i >= 0; i--) {
        const wv = waves[i];
        wv.r += (wv.max - wv.r) * 0.012 + 0.6;
        const p = wv.r / wv.max;            // 0 → 1
        const alpha = Math.sin(Math.min(p, 1) * Math.PI) * 0.28;  // fade in then out
        if (p >= 1) { waves.splice(i, 1); continue; }
        const [cr, cg, cb] = wv.col;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        // inner echo ring
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(alpha * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // drifting particles (nudged outward by passing waves)
      for (const pt of particles) {
        for (const wv of waves) {
          const dx = pt.x - wv.x, dy = pt.y - wv.y;
          const d = Math.hypot(dx, dy);
          if (Math.abs(d - wv.r) < 26) {
            const f = 0.4 / (d || 1);
            pt.vx += dx * f * 0.02; pt.vy += dy * f * 0.02;
          }
        }
        pt.x += pt.vx; pt.y += pt.vy; pt.tw += 0.02;
        pt.vx *= 0.992; pt.vy = pt.vy * 0.992 - 0.0006; // settle, keep gentle rise
        if (pt.y < -10) { pt.y = h + 10; pt.x = Math.random() * w; pt.vy = -(Math.random() * 0.28 + 0.06); }
        if (pt.x < -10) pt.x = w + 10;
        if (pt.x > w + 10) pt.x = -10;
        const alpha = pt.a * (0.6 + 0.4 * Math.sin(pt.tw));
        ctx.beginPath();
        ctx.fillStyle = pt.c + alpha.toFixed(3) + ')';
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(tick);
    }
    function start() { if (!raf) raf = window.requestAnimationFrame(tick); }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = null; } }

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    resize();
    start();
  }

  /* ============================================================
     CURSOR: magical particle trail that follows the mouse
     ============================================================ */
  if (hasFinePointer && !prefersReduced) {
    const cur = document.createElement('canvas');
    cur.id = 'cursorCanvas';
    cur.setAttribute('aria-hidden', 'true');
    Object.assign(cur.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '70', mixBlendMode: 'screen'
    });
    document.body.appendChild(cur);

    const cctx = cur.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 0, ch = 0, trail = [], craf = null, idle = 0;
    let mx = -999, my = -999, pmx = -999, pmy = -999, moved = false;
    const HUES = ['63,214,255', '154,240,255', '123,92,255', '255,91,192', '255,184,107'];

    function cresize() {
      cw = window.innerWidth; ch = window.innerHeight;
      cur.width = Math.floor(cw * dpr); cur.height = Math.floor(ch * dpr);
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function emit(x, y, speed) {
      const count = Math.min(4, 1 + (speed * 0.12) | 0);
      for (let i = 0; i < count; i++) {
        trail.push({
          x, y,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.3,
          r: Math.random() * 2.4 + 1,
          life: 1,
          decay: Math.random() * 0.025 + 0.018,
          c: HUES[(Math.random() * HUES.length) | 0]
        });
      }
    }
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; moved = true; idle = 0;
    }, { passive: true });

    function cstep() {
      cctx.clearRect(0, 0, cw, ch);
      if (moved) {
        if (pmx < -900) { pmx = mx; pmy = my; }
        const speed = Math.hypot(mx - pmx, my - pmy);
        // sample along the path so fast moves stay continuous
        const steps = Math.max(1, Math.min(6, (speed / 6) | 0));
        for (let s = 1; s <= steps; s++) {
          emit(pmx + (mx - pmx) * (s / steps), pmy + (my - pmy) * (s / steps), speed);
        }
        pmx = mx; pmy = my; moved = false;
      } else {
        idle++;
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.012; p.vx *= 0.96; p.vy *= 0.96;
        p.life -= p.decay;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        const a = p.life * 0.9;
        const rad = p.r * p.life;
        const g = cctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3);
        g.addColorStop(0, `rgba(${p.c},${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${p.c},0)`);
        cctx.fillStyle = g;
        cctx.beginPath();
        cctx.arc(p.x, p.y, rad * 3, 0, Math.PI * 2);
        cctx.fill();
      }
      // soft glowing core dot at the cursor
      if (idle < 60 && mx > -900) {
        const g = cctx.createRadialGradient(mx, my, 0, mx, my, 16);
        g.addColorStop(0, 'rgba(154,240,255,0.5)');
        g.addColorStop(1, 'rgba(154,240,255,0)');
        cctx.fillStyle = g;
        cctx.beginPath(); cctx.arc(mx, my, 16, 0, Math.PI * 2); cctx.fill();
      }
      craf = window.requestAnimationFrame(cstep);
    }
    window.addEventListener('resize', cresize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (craf) { cancelAnimationFrame(craf); craf = null; } }
      else if (!craf) craf = requestAnimationFrame(cstep);
    });
    cresize();
    craf = requestAnimationFrame(cstep);
  }
})();
