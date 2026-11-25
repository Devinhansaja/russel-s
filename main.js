(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const body = document.body;
  let menuTl = null;
  let lenis = null;

  /* ---------- lazy background videos (load + play only when near the viewport) ---------- */
  const vio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: '60% 0px' });
  $$('video.lazyv').forEach((v) => vio.observe(v));

  /* ---------- forms -> email ---------- */
  $$('form[data-mailto]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const lines = [...d.entries()].filter(([, v]) => v).map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}: ${v}`);
    const subject = (f.dataset.subject || 'Enquiry') + (d.get('service') ? ' — ' + d.get('service') : '');
    location.href = `mailto:${f.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }));

  /* ---------- fullscreen menu (works with or without GSAP) ---------- */
  function initMenu(build) {
    const b = $('.burger'), m = $('.menu'), v = $('.menu__video');
    if (!b || !m) return;
    if (build) menuTl = build();
    b.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      b.setAttribute('aria-expanded', open);
      m.setAttribute('aria-hidden', !open);
      if (open && !v.src) v.src = v.dataset.src;
      open ? v.play().catch(() => {}) : v.pause();
      if (menuTl) { open ? menuTl.timeScale(1).play() : menuTl.timeScale(1.6).reverse(); }
      else { m.style.visibility = open ? 'visible' : 'hidden'; m.style.clipPath = open ? 'none' : ''; }
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }
  const closeMenu = () => { if (body.classList.contains('menu-open')) $('.burger').click(); };

  /* ---------- no-animation fallback ---------- */
  if (reduced || !hasGsap) {
    body.classList.remove('is-loading');
    $$('.loader, .bar, .curtain').forEach((n) => n.remove());
    initMenu(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  const ease = 'expo.out';

  /* ---------- smooth scroll ---------- */
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.__lenis = lenis;
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    closeMenu();
    lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- page-to-page curtain transition ---------- */
  const curtain = $('.curtain');
  $$('a[href]').forEach((a) => {
    const h = a.getAttribute('href');
    if (!/^[\w-]+\.html(#.*)?$/.test(h) || a.target === '_blank') return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || !curtain) return;
      e.preventDefault();
      curtain.classList.remove('is-off');
      gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: .8, ease: 'expo.inOut', onComplete: () => { location.href = h; } });
    });
  });
  addEventListener('pageshow', (e) => { if (e.persisted && curtain) { gsap.set(curtain, { yPercent: -100 }); closeMenu(); } });

  /* ---------- text splitting ---------- */
  $$('.split').forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join('');
  });
  $$('.fill').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  const start = () => { body.classList.remove('is-loading'); lenis && lenis.start(); };

  if ($('.loader')) {
    /* ---------- HOME: preloader -> hero intro ---------- */
    gsap.set('.bar', { height: '50vh' });
    gsap.set('.hero__title .ch', { yPercent: 120, rotate: 6 });
    gsap.set('.hero__title .script', { opacity: 0, scale: .6 });
    gsap.set(['.hero__eyebrow', '.hero__lede', '.hero__cta', '.hero__meta span', '.scrollcue', '.nav'], { opacity: 0, y: 24 });
    const num = $('.loader__num'); const counter = { v: 0 };
    gsap.timeline({ defaults: { ease } })
      .to('.loader__mark span', { y: 0, duration: 1.2 })
      .to(counter, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0)
      .to('.loader__line i', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0)
      .to('.loader__inner', { opacity: 0, y: -30, duration: .7, ease: 'power2.in' })
      .set('.loader__panel', { autoAlpha: 0 })
      .add(start)
      .to('.bar', { height: '9vh', duration: 1.9, ease: 'expo.inOut' }, '<')
      .fromTo('.hero__media .bgv', { scale: 1.6 }, { scale: 1.25, duration: 3, ease: 'power3.out' }, '<')
      .to('.hero__title .ch', { yPercent: 0, rotate: 0, duration: 1.5, stagger: .035 }, '<.7')
      .to('.hero__title .script', { opacity: 1, scale: 1, duration: 1.2 }, '<.6')
      .to(['.hero__eyebrow', '.hero__lede', '.hero__cta', '.nav', '.scrollcue'], { opacity: 1, y: 0, duration: 1.2, stagger: .1 }, '<.2')
      .to('.hero__meta span', { opacity: 1, y: 0, duration: 1, stagger: .08 }, '<')
      .to('.bar', { height: 0, duration: 1.6, ease: 'expo.inOut' }, '-=.6')
      .add(() => { const l = $('.loader'); l && l.remove(); ScrollTrigger.refresh(); });
    gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: true } });
  } else {
    /* ---------- INNER PAGES: curtain lifts, title rises ---------- */
    gsap.set('.phero__title .ch', { yPercent: 120, rotate: 5 });
    gsap.set(['.phero .eyebrow', '.phero__lede', '.phero__crumb'], { opacity: 0, y: 24 });
    gsap.timeline({ defaults: { ease } })
      .to('.curtain span', { opacity: 0, duration: .4, delay: .25 })
      .to(curtain, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<.1')
      .add(start, '<.3')
      .fromTo('.phero .bgv', { scale: 1.5 }, { scale: 1.15, duration: 2.6, ease: 'power3.out' }, '<')
      .to('.phero__title .ch', { yPercent: 0, rotate: 0, duration: 1.4, stagger: .03 }, '<.25')
      .to(['.phero .eyebrow', '.phero__lede', '.phero__crumb'], { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, '<.3')
      .add(() => { curtain && curtain.classList.add('is-off'); ScrollTrigger.refresh(); });
    if ($('.phero')) {
      gsap.to('.phero__media', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.phero__content', { yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.phero', start: '30% top', end: 'bottom top', scrub: true } });
    }
  }

  /* ---------- nav hide / solid ---------- */
  const nav = $('.nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      const y = s.scroll();
      nav.classList.toggle('is-solid', y > 80);
      nav.classList.toggle('is-hidden', s.direction === 1 && y > 400 && !body.classList.contains('menu-open'));
    },
  });

  /* ---------- marquees (speed + direction follow scroll) ---------- */
  const mq = [];
  $$('.clients__track').forEach((ct) => { ct.innerHTML += ct.innerHTML; mq.push(gsap.to(ct, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })); });
  $$('.marquee__track').forEach((t) => mq.push(gsap.to(t, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 })));
  if (mq.length) ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      const boost = 1 + Math.min(Math.abs(s.getVelocity()) / 350, 6);
      mq.forEach((t) => { gsap.to(t, { timeScale: s.direction * boost, duration: .2, overwrite: true }); gsap.to(t, { timeScale: s.direction, duration: 1, delay: .2 }); });
    },
  });

  /* ---------- generic reveals ---------- */
  $$('.reveal').forEach((el) => gsap.from(el, { opacity: 0, y: 40, duration: 1.3, ease, scrollTrigger: { trigger: el, start: 'top 88%' } }));
  $$('.rise').forEach((el) => gsap.from($$('.line > span', el), { yPercent: 115, duration: 1.5, ease, stagger: .12, scrollTrigger: { trigger: el, start: 'top 85%' } }));
  $$('.stagger').forEach((el) => gsap.from(el.children, { opacity: 0, y: 50, duration: 1.2, ease, stagger: .1, scrollTrigger: { trigger: el, start: 'top 82%' } }));
  $$('.clip').forEach((el) => {
    const img = $('img', el);
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 90%' } });
    if (img) gsap.fromTo(img, { yPercent: -15, scale: 1.15 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    const sp = parseFloat(el.dataset.speed || 0);
    if (sp) gsap.to(el, { y: () => -innerHeight * sp, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.fill').forEach((el) => gsap.to($$('.w', el), { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true } }));
  $$('.count').forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.to, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); }, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  $$('.pvideo').forEach((el) => gsap.fromTo($('.bgv', el), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- expanding film window ---------- */
  if ($('.window')) gsap.timeline({ scrollTrigger: { trigger: '.window', start: 'top top', end: 'bottom bottom', scrub: true } })
    .fromTo('.window__frame',
      { clipPath: innerWidth < 800 ? 'inset(24% 14% 24% 14% round 140px)' : 'inset(28% 36% 28% 36% round 200px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power1.inOut', duration: 1 })
    .to('.window__frame .bgv', { scale: 1, ease: 'none', duration: 1 }, 0)
    .to('.window__word--a', { xPercent: -30, opacity: 0, ease: 'power1.in', duration: .8 }, .15)
    .to('.window__word--b', { xPercent: 30, opacity: 0, ease: 'power1.in', duration: .8 }, .15)
    .to('.window__caption', { opacity: 1, duration: .35 }, .8)
    .to({}, { duration: .35 });

  /* ---------- stacked film panels ---------- */
  const panels = $$('.panel');
  panels.forEach((p, i) => {
    const next = panels[i + 1];
    if (next) gsap.to(p, { scale: .9, filter: 'brightness(.35)', borderRadius: 28, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 55%' }, defaults: { ease } })
      .from($$('.panel__title .line > span', p), { yPercent: 115, duration: 1.5, stagger: .12 })
      .from([$('.panel__head .eyebrow', p), $('.panel__no', p)], { opacity: 0, y: 30, duration: 1.2, stagger: .1 }, .1)
      .from($$('.panel__body > *', p), { opacity: 0, y: 30, duration: 1.2, stagger: .1 }, .3);
    gsap.fromTo($('.bgv', p), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- mobile: small packs on an auto-scrolling belt (touch to pause) ---------- */
  if ($('.blends__track') && innerWidth <= 800) {
    const track = $('.blends__track');
    const cards = $$('.blend', track);
    const wrap = document.createElement('div'); wrap.className = 'blends__beltwrap';
    const belt = document.createElement('div'); belt.className = 'blends__belt';
    cards.forEach((c) => belt.appendChild(c));
    cards.forEach((c) => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1; belt.appendChild(k); });
    wrap.appendChild(belt);
    $('.blends__intro', track).after(wrap);
    const tw = gsap.to(belt, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
    wrap.addEventListener('touchstart', () => tw.pause(), { passive: true });
    wrap.addEventListener('touchend', () => gsap.delayedCall(1.2, () => tw.play()), { passive: true });
  }

  /* ---------- horizontal blends ---------- */
  if ($('.blends__track')) gsap.matchMedia().add('(min-width: 801px)', () => {
    const track = $('.blends__track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.blends__pin', pin: true, scrub: .8, end: () => '+=' + dist(), invalidateOnRefresh: true } });
    $$('.blend').forEach((b, i) => gsap.from(b, { yPercent: 18 + (i % 3) * 8, rotate: 4, ease: 'none', scrollTrigger: { trigger: b, containerAnimation: tw, start: 'left right', end: 'left 45%', scrub: true } }));
  });

  /* ---------- CTA + footer ---------- */
  $$('.cta, .band').forEach((el) => gsap.fromTo($('.bgv', el), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.from('.footer__word span', { yPercent: 110, duration: 1.6, ease, stagger: .06, scrollTrigger: { trigger: '.footer__word', start: 'top 92%' } });

  /* ---------- cursor + magnetic buttons ---------- */
  if (matchMedia('(hover: hover)').matches) {
    const cur = $('.cursor'), lab = $('.cursor__label');
    const xTo = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    addEventListener('mousemove', (e) => { cur.classList.add('is-on'); xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('mouseover', (e) => {
      const l = e.target.closest('[data-cursor]');
      const a = e.target.closest('a,button,.chip');
      cur.classList.toggle('is-label', !!l);
      cur.classList.toggle('is-link', !l && !!a);
      if (l) lab.textContent = l.dataset.cursor;
    });
    $$('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .35, y: (e.clientY - r.top - r.height / 2) * .45, duration: .5, ease: 'power3' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ---------- fullscreen menu ---------- */
  initMenu(() => {
    gsap.set('.menu__list a', { yPercent: 110 });
    gsap.set('.menu__foot', { opacity: 0 });
    return gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set('.menu', { visibility: 'visible' })
      .to('.menu', { clipPath: 'inset(0 0 0% 0)', duration: 1.1 })
      .to('.menu__list a', { yPercent: 0, duration: 1.1, stagger: .06, ease }, '-=.55')
      .to('.menu__foot', { opacity: 1, duration: .8 }, '-=.7');
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
