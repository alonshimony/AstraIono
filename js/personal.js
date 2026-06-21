/* ============================================================
   ASTRA IONO — Personal page motion
   Particles, cursor light, parallax tilt, rising energy sparks.
   ============================================================ */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Rising energy sparks around the figure ---------- */
  const sparks = document.getElementById('sparks');
  if (sparks && !reduced) {
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.style.left = (6 + Math.random() * 88) + '%';
      s.style.bottom = (Math.random() * 24) + '%';
      const dur = 3.2 + Math.random() * 3.8;
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = (-Math.random() * dur) + 's';
      const scale = 0.5 + Math.random() * 1.4;
      s.style.width = s.style.height = (3 * scale).toFixed(1) + 'px';
      s.style.opacity = '';
      sparks.appendChild(s);
    }
  }

  /* ---------- Cursor light + portal parallax tilt ---------- */
  const glow = document.getElementById('cursorGlow');
  const portal = document.getElementById('portal');
  if (fine && !reduced) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (glow) glow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    function tick() {
      raf = null;
      if (portal) {
        const nx = (tx / window.innerWidth) - 0.5;   // -0.5 … 0.5
        const ny = (ty / window.innerHeight) - 0.5;
        // ease toward target for a smooth, weighty feel
        cx += (nx - cx) * 0.12; cy += (ny - cy) * 0.12;
        portal.style.setProperty('--tiltY', (cx * 10).toFixed(2) + 'deg');
        portal.style.setProperty('--tiltX', (-cy * 8).toFixed(2) + 'deg');
        if (Math.abs(nx - cx) > 0.002 || Math.abs(ny - cy) > 0.002) raf = requestAnimationFrame(tick);
      }
    }
  }

  /* ---------- Ambient particle field ---------- */
  const canvas = document.getElementById('px');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, parts = [], raf = null;
    const COLORS = ['rgba(120,210,255,', 'rgba(189,244,255,', 'rgba(123,92,255,', 'rgba(63,214,255,'];

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor((w * h) / 15000));
      parts = [];
      for (let i = 0; i < n; i++) parts.push(mk());
    }
    function mk() {
      return {
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -(Math.random() * 0.26 + 0.05),
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const a = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.fillStyle = p.c + a.toFixed(3) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf) raf = requestAnimationFrame(tick); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    resize(); start();
  }
})();
