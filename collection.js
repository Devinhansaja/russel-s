/* Tea Collection: category filters, search, sort, quick-view modal. Data comes from data/products.js */
(() => {
  const P = window.PRODUCTS || [];
  const CATS = {
    'ceylon-health-and-wellness-teas': ['Health & Wellness Teas', 'Functional blends for calm, sleep, beauty, heart and balance.'],
    'ceylon-ancestral-herbal-infusions': ['Ancestral Herbal Infusions', 'Time-honoured Sri Lankan herbs, blended for everyday wellbeing.'],
    'ceylon-fine-teas': ['Ceylon Fine Teas', 'Classic Ceylon black teas — loose leaf and tea bags.'],
    'ceylon-artisan-teas': ['Ceylon Artisan Teas', 'Rare, hand-crafted white, oolong and black teas.'],
    'ceylon-organic-specialty-teas': ['Organic Specialty Teas', 'Certified-organic greens, blacks and flavoured blends.'],
    'balms-butters': ['Balms & Butters', 'Herbal balms and butters for skin, hair and comfort.'],
  };
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lkr = (n) => 'LKR ' + n.toLocaleString('en-US');
  const price = (p) => (p.p < p.r ? `<s>${lkr(p.r)}</s><b>${lkr(p.p)}</b>` : lkr(p.p));

  const grid = $('#grid'), filters = $('#filters'), search = $('#search'), sort = $('#sort');
  const title = $('#cat-title'), blurb = $('#cat-blurb'), modal = $('#modal');
  const state = { cat: CATS[location.hash.slice(1)] ? location.hash.slice(1) : 'all', q: '', sort: 'default' };

  filters.innerHTML = `<button class="fbtn" data-cat="all">All<sup>${P.length}</sup></button>` +
    Object.entries(CATS).map(([k, [n]]) => `<button class="fbtn" data-cat="${k}">${n}<sup>${P.filter((p) => p.c === k).length}</sup></button>`).join('');

  function render(animate) {
    let list = P.filter((p) => (state.cat === 'all' || p.c === state.cat) && (!state.q || p.n.toLowerCase().includes(state.q)));
    if (state.sort === 'low') list = [...list].sort((a, b) => a.p - b.p);
    if (state.sort === 'high') list = [...list].sort((a, b) => b.p - a.p);
    if (state.sort === 'az') list = [...list].sort((a, b) => a.n.localeCompare(b.n));

    [...filters.children].forEach((b) => b.classList.toggle('is-on', b.dataset.cat === state.cat));
    title.innerHTML = state.cat === 'all' ? 'The full <em class="it">collection.</em>' : esc(CATS[state.cat][0]);
    blurb.textContent = state.cat === 'all' ? `${list.length} teas, infusions and herbal care products from Russel's Wellness.` : CATS[state.cat][1];

    grid.innerHTML = list.length ? list.map((p) => `
      <button class="pcard" data-i="${P.indexOf(p)}" data-cursor="View">
        <div class="pcard__img">
          ${p.p < p.r ? `<span class="pcard__tag">-${Math.round((1 - p.p / p.r) * 100)}%</span>` : (!p.s ? '<span class="pcard__tag pcard__tag--out">Out of stock</span>' : '')}
          <img loading="lazy" src="${esc(p.i)}" alt="${esc(p.n)}">
        </div>
        <span class="pcard__cat">${esc(CATS[p.c][0])}</span>
        <h3>${esc(p.n)}</h3>
        <span class="price">${price(p)}</span>
      </button>`).join('') : '<p class="empty">No teas match that search.</p>';

    /* cards fade up as they enter the viewport (CSS transition, staggered per batch) */
    [...grid.querySelectorAll('.pcard')].forEach((c) => io.observe(c));
    if (animate && window.ScrollTrigger) ScrollTrigger.refresh();
  }
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      e.target.style.transitionDelay = (i * 60) + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });

  filters.addEventListener('click', (e) => {
    const b = e.target.closest('.fbtn'); if (!b) return;
    state.cat = b.dataset.cat;
    history.replaceState(null, '', state.cat === 'all' ? location.pathname : '#' + state.cat);
    render(true);
    const top = $('#shop').getBoundingClientRect().top + scrollY - 70;
    if (scrollY > top) (window.__lenis ? window.__lenis.scrollTo(top, { duration: 1 }) : scrollTo({ top, behavior: 'smooth' }));
  });
  search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); render(true); });
  sort.addEventListener('change', () => { state.sort = sort.value; render(true); });

  /* quick view */
  let last = null;
  function open(p, from) {
    last = from;
    $('#m-img').src = p.f; $('#m-img').alt = p.n;
    $('#m-cat').lastChild.textContent = CATS[p.c][0];
    $('#m-name').textContent = p.n;
    $('#m-desc').textContent = p.d;
    $('#m-price').innerHTML = price(p) + (p.s ? '' : ' · Out of stock');
    $('#m-link').href = p.u;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    window.__lenis && window.__lenis.stop();
    $('.modal__x').focus();
  }
  function close() {
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    window.__lenis && window.__lenis.start();
    last && last.focus();
  }
  grid.addEventListener('click', (e) => { const c = e.target.closest('.pcard'); if (c) open(P[+c.dataset.i], c); });
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });

  render(false);
})();
