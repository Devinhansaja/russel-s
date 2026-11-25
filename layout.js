/* Shared chrome for every page: grain, cursor, page curtain, nav, fullscreen menu, CTA band, footer. */
(() => {
  const page = document.body.dataset.page || 'home';
  const links = [
    ['home', 'index.html', 'Home'],
    ['tea', 'tea-service.html', 'Tea Service'],
    ['catering', 'catering.html', 'Catering'],
    ['collection', 'collection.html', 'Tea Collection'],
    ['dimbula', 'dimbula.html', 'Dimbula Tea'],
    ['about', 'about.html', 'About'],
    ['contact', 'contact.html', 'Contact'],
  ];
  const cur = (k) => (k === page ? ' aria-current="page"' : '');

  const top = `
<div class="grain" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>
<div class="curtain${page === 'home' ? ' is-off' : ''}" aria-hidden="true"><span>Russel's</span></div>
<header class="nav">
  <a class="nav__logo" href="index.html" aria-label="Russel's home">Russel's</a>
  <nav class="nav__links">
    ${links.slice(1, 6).map(([k, h, t]) => `<a href="${h}"${cur(k)}>${t}</a>`).join('')}
  </nav>
  <div class="nav__right">
    <a class="btn btn--sm magnetic" href="contact.html"><span>Request a Quote</span></a>
    <button class="burger" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button>
  </div>
</header>
<div class="menu" aria-hidden="true">
  <video class="menu__video" muted loop playsinline preload="none" data-src="assets/video/20824-720.mp4"></video>
  <ul class="menu__list">
    ${links.map(([k, h, t], i) => `<li><a href="${h}"${cur(k)}><em>0${i + 1}</em><span>${t}</span></a></li>`).join('')}
  </ul>
  <div class="menu__foot">
    <span>820/1, Maradana Road, Colombo 10</span>
    <span>011 268 6058</span>
    <a href="contact.html#careers">Careers →</a>
  </div>
</div>`;

  const band = document.body.hasAttribute('data-noband') ? '' : `
<section class="band">
  <video class="bgv lazyv" muted loop playsinline preload="none" data-src="assets/video/49323-720.mp4"></video>
  <div class="band__shade"></div>
  <div class="band__inner">
    <p class="eyebrow reveal"><i></i>Request a quote</p>
    <h2 class="rise"><span class="line"><span>Let us set</span></span> <span class="line"><span class="it">the table.</span></span></h2>
    <a class="btn magnetic reveal" href="contact.html"><span>Talk to Russel's →</span></a>
  </div>
</section>`;

  const foot = `${band}
<footer class="footer">
  <div class="footer__top">
    <p class="footer__tag">More than a<br><span class="it">matter of taste.</span></p>
    <nav>
      <a href="https://www.facebook.com/russelscatering" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.instagram.com/russels.teaservices.catering" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.linkedin.com/company/russels-teaservice-catering/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://www.tiktok.com/@russels.tea_catering" target="_blank" rel="noopener">TikTok</a>
    </nav>
    <nav>
      ${links.slice(1).map(([, h, t]) => `<a href="${h}">${t}</a>`).join('')}
      <a href="contact.html#careers">Careers</a>
    </nav>
  </div>
  <div class="footer__word" aria-hidden="true"><span>R</span><span>u</span><span>s</span><span>s</span><span>e</span><span>l</span><span>'</span><span>s</span></div>
  <div class="footer__base"><span>© 2026 Russel's (Pvt) Limited. All rights reserved.</span><a href="#top">Back to top ↑</a></div>
</footer>`;

  document.body.insertAdjacentHTML('afterbegin', top);
  document.querySelector('main').insertAdjacentHTML('afterend', foot);
})();
