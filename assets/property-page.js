const root = document.documentElement;

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value != null) element.textContent = value;
};

const setImage = (selector, image) => {
  const element = document.querySelector(selector);
  if (!element || !image) return;
  element.src = image.src;
  element.alt = image.alt || '';
  if (image.position) element.style.objectPosition = image.position;
};

const setTitleLines = (selector, lines) => {
  const element = document.querySelector(selector);
  if (!element || !Array.isArray(lines)) return;
  element.replaceChildren(...lines.flatMap((line, index) => {
    const text = document.createTextNode(line);
    return index === lines.length - 1 ? [text] : [text, document.createElement('br')];
  }));
};

const bindMaterial = (key, material) => {
  const card = document.querySelector(`[data-card="${key}"]`);
  if (!card || !material) return;
  const text = (selector, value) => {
    const element = card.querySelector(selector);
    if (element && value != null) element.textContent = value;
  };
  text('.material-number', material.number);
  text('.material-kind', material.eyebrow);
  setTitleLines(`#${key}-title`, material.titleLines);
  text(`#${key}-copy`, material.copy);
  const open = card.querySelector('[data-action="open"]');
  const download = card.querySelector('[data-action="download"]');
  if (open) { open.href = material.file; open.firstChild.textContent = `${material.openLabel} `; }
  if (download) { download.href = material.file; download.download = ''; download.firstChild.textContent = `${material.downloadLabel} `; }
};

try {
  const response = await fetch('property.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`property.json: ${response.status}`);
  const property = await response.json();

  document.title = property.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', property.meta.description);
  document.querySelector('.brand')?.setAttribute('href', property.brand.homeHref);
  document.querySelector('.brand')?.setAttribute('aria-label', property.brand.ariaLabel);
  setImage('.brand img', property.brand.logo);
  setText('.header-link .label', property.navigation.materialsLabel);

  setImage('.hero>img', property.hero.image);
  setText('#hero-eyebrow', property.hero.eyebrow);
  setTitleLines('#title', property.hero.titleLines);
  setText('#hero-subtitle', property.hero.subtitle);
  setText('.scroll-note .label', property.hero.scrollLabel);

  setText('.intro>.eyebrow', property.intro.eyebrow);
  setText('#intro-title', property.intro.title);
  setText('#intro-copy', property.intro.copy);

  const gallery = document.querySelector('.gallery');
  if (gallery) {
    gallery.setAttribute('aria-label', property.gallery.ariaLabel);
    gallery.dataset.galleryLabel = property.gallery.label;
  }
  property.gallery.images.forEach((image, index) => setImage(`.gallery figure:nth-of-type(${index + 1}) img`, image));
  setText('.gallery-note', property.gallery.note);

  setText('.materials>.eyebrow', property.materials.eyebrow);
  setText('#materials-title', property.materials.title);
  bindMaterial('guide', property.materials.guide);
  bindMaterial('book', property.materials.book);

  setText('#footer-property', property.footer.property);
  setText('#footer-copyright', property.footer.copyright);
} catch (error) {
  console.error('Não foi possível carregar a configuração do imóvel.', error);
} finally {
  root.classList.remove('content-loading');
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const intro = document.querySelector('.intro');
const galleryFigures = [...document.querySelectorAll('.gallery figure')];
const progressBar = document.createElement('div');
progressBar.className = 'property-progress';
progressBar.setAttribute('aria-hidden', 'true');
document.body.prepend(progressBar);

const sections = [
  { element: hero, label: 'Abertura' },
  { element: intro, label: 'Experiência' },
  { element: document.querySelector('.gallery'), label: 'Galeria' },
  { element: document.querySelector('.materials'), label: 'Materiais' }
].filter((item) => item.element);

sections.forEach((item, index) => {
  if (!item.element.id) item.element.id = `secao-${index + 1}`;
});

const rail = document.createElement('nav');
rail.className = 'section-rail';
rail.setAttribute('aria-label', 'Navegação desta página');
sections.forEach((item, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `Ir para ${item.label}`);
  button.innerHTML = `<span>${item.label}</span>`;
  button.addEventListener('click', () => item.element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }));
  rail.append(button);
});
document.body.append(rail);

document.querySelectorAll('.material-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  });
});
const revealItems = document.querySelectorAll('.intro>* ,.gallery figure,.gallery-note,.materials>.eyebrow,.materials>h2,.material-card');

revealItems.forEach((item) => item.classList.add('experience-reveal'));
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -7%' });
  revealItems.forEach((item) => observer.observe(item));
}

let ticking = false;
const renderScroll = () => {
  const scroll = Math.max(0, window.scrollY);
  const progress = Math.min(1, scroll / Math.max(1, window.innerHeight));
  root.style.setProperty('--hero-y', `${progress * 28}px`);
  root.style.setProperty('--hero-scale', String(1.06 + progress * .05));
  root.style.setProperty('--hero-copy-y', `${progress * -22}px`);
  root.style.setProperty('--hero-copy-opacity', String(1 - progress * .72));
  root.style.setProperty('--hero-shade-opacity', String(1 - progress * .2));
  const pageMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progressBar.style.transform = `scaleX(${Math.min(1, scroll / pageMax)})`;
  header?.classList.toggle('is-scrolled', scroll > 20);

  if (intro && window.innerWidth > 700) {
    const rect = intro.getBoundingClientRect();
    const reveal = Math.max(0, Math.min(100, ((window.innerHeight * .82 - rect.top) / (window.innerHeight * .62)) * 100));
    intro.style.setProperty('--intro-reveal', `${reveal}%`);
  }

  if (window.innerWidth > 700) {
    galleryFigures.forEach((figure, index) => {
      const rect = figure.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      figure.style.setProperty('--gallery-y', `${centerOffset * (index % 2 ? -20 : 20)}px`);
    });
  }

  let activeIndex = 0;
  sections.forEach((item, index) => {
    if (item.element.getBoundingClientRect().top <= window.innerHeight * .48) activeIndex = index;
  });
  [...rail.children].forEach((button, index) => button.classList.toggle('is-active', index === activeIndex));
  ticking = false;
};

if (!reduceMotion) {
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScroll);
  }, { passive: true });
}
renderScroll();
