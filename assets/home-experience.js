(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var hero = document.querySelector('.hero');
  var intro = document.querySelector('.introduction');
  var services = Array.prototype.slice.call(document.querySelectorAll('.services .service'));
  var sections = [
    { element: hero, label: 'Início' },
    { element: intro, label: 'O olhar' },
    { element: document.querySelector('.services'), label: 'Abordagem' },
    { element: document.querySelector('.closing-panel'), label: 'Contato' }
  ].filter(function (item) { return item.element; });

  var rail = document.createElement('nav');
  rail.className = 'home-section-rail';
  rail.setAttribute('aria-label', 'Navegação da página');
  var railButtons = sections.map(function (section) {
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Ir para ' + section.label);
    var label = document.createElement('span');
    label.textContent = section.label;
    button.append(label);
    button.addEventListener('click', function () {
      section.element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    rail.append(button);
    return button;
  });
  document.body.append(rail);

  var setHeroLight = function (event) {
    if (window.innerWidth <= 768 || !hero) return;
    var rect = hero.getBoundingClientRect();
    root.style.setProperty('--hero-light-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
    root.style.setProperty('--hero-light-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
  };
  hero && hero.addEventListener('pointermove', setHeroLight, { passive: true });

  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.hero-link,.diagnostic-link').forEach(function (link) {
      link.addEventListener('pointermove', function (event) {
        var rect = link.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * .11;
        var y = (event.clientY - rect.top - rect.height / 2) * .11;
        link.style.setProperty('--magnet-x', x.toFixed(1) + 'px');
        link.style.setProperty('--magnet-y', y.toFixed(1) + 'px');
      });
      link.addEventListener('pointerleave', function () {
        link.style.setProperty('--magnet-x', '0px');
        link.style.setProperty('--magnet-y', '0px');
      });
    });
  }

  var ticking = false;
  var render = function () {
    var scroll = Math.max(0, window.scrollY);
    var viewport = Math.max(1, window.innerHeight);
    var heroProgress = Math.min(1, scroll / viewport);
    if (!reduceMotion) {
      root.style.setProperty('--hero-media-y', (heroProgress * 34).toFixed(1) + 'px');
      root.style.setProperty('--hero-media-scale', (1.04 + heroProgress * .075).toFixed(3));
      root.style.setProperty('--hero-copy-y', (heroProgress * -32).toFixed(1) + 'px');
      root.style.setProperty('--hero-copy-opacity', (1 - heroProgress * .76).toFixed(2));
      root.style.setProperty('--hero-scrim-opacity', (1 - heroProgress * .22).toFixed(2));
    }
    if (intro && window.innerWidth > 768) {
      var introRect = intro.getBoundingClientRect();
      var introProgress = Math.max(0, Math.min(100, ((viewport * .8 - introRect.top) / (viewport * .6)) * 100));
      root.style.setProperty('--intro-reveal', introProgress.toFixed(1) + '%');
    }
    services.forEach(function (service) {
      var rect = service.getBoundingClientRect();
      var isCurrent = rect.top < viewport * .62 && rect.bottom > viewport * .36;
      service.classList.toggle('is-current', isCurrent);
    });
    var active = 0;
    sections.forEach(function (section, index) {
      if (section.element.getBoundingClientRect().top <= viewport * .48) active = index;
    });
    railButtons.forEach(function (button, index) { button.classList.toggle('is-active', index === active); });
    ticking = false;
  };
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }, { passive: true });
  window.addEventListener('resize', render, { passive: true });
  render();
}());
