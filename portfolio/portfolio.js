(() => {
  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value) element.textContent = value;
  };
  const setLines = (selector, lines) => {
    const element = document.querySelector(selector);
    if (!element || !Array.isArray(lines)) return;
    element.replaceChildren(...lines.flatMap((line, index) => index ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
  };
  const setAction = (selector, label) => {
    const element = document.querySelector(selector);
    if (!element || !label) return;
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '→';
    element.replaceChildren(document.createTextNode(label), icon);
  };
  const createProject = (project, index, action) => {
    const article = document.createElement('article');
    article.className = `project project-${project.layout || 'large'}`;
    article.id = project.id || `projeto-${String(index + 1).padStart(2, '0')}`;
    const link = document.createElement('a');
    link.className = 'project-link'; link.href = project.href || '/company-profile/#portfolio';
    link.setAttribute('aria-label', `${action}: ${project.title}`);
    const picture = document.createElement('picture');
    const source = document.createElement('source'); source.media = '(max-width: 768px)'; source.srcset = project.mobileImage || project.desktopImage;
    const img = document.createElement('img');
    img.src = project.desktopImage || project.mobileImage; img.alt = project.alt || project.title || '';
    img.loading = index < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
    picture.append(source, img);
    const image = document.createElement('div'); image.className = 'project-image'; image.append(picture);
    const number = document.createElement('span'); number.className = 'project-number'; number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('h2'); title.textContent = project.title || `Projeto ${index + 1}`;
    const titleBox = document.createElement('div'); titleBox.append(number, title);
    const category = document.createElement('span'); category.className = 'project-category'; category.textContent = project.category || '';
    const info = document.createElement('div'); info.className = 'project-info'; info.append(titleBox, category);
    link.append(image, info); article.append(link); return article;
  };
  const enableExperience = () => {
    const root = document.documentElement;
    const updateProgress = () => {
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--portfolio-progress', max > 0 ? `${window.scrollY / max}` : '0');
    };
    updateProgress(); window.addEventListener('scroll', updateProgress, { passive: true });
    const targets = document.querySelectorAll('.portfolio-intro > *, .project, .portfolio-cta, .site-footer');
    if (!('IntersectionObserver' in window)) return targets.forEach(target => target.classList.add('is-visible'));
    const observer = new IntersectionObserver((entries, instance) => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); instance.unobserve(entry.target);
    }), { threshold: .12 });
    targets.forEach(target => observer.observe(target));
  };
  const setActiveNavigation = () => {
    const current = window.location.pathname.replace(/\/$/, '');
    document.querySelectorAll('.desktop-nav a').forEach(link => {
      if (new URL(link.href).pathname.replace(/\/$/, '') === current) link.classList.add('active');
    });
  };
  const hydrate = async () => {
    try {
      const response = await fetch('./portfolio.json');
      if (!response.ok) throw new Error('Configuração do portfólio indisponível.');
      const config = await response.json();
      document.title = config.page?.title || document.title;
      setText('#portfolio-label', config.page?.label); setLines('#portfolio-title', config.page?.headline);
      setText('#portfolio-intro-text', config.page?.intro); setText('.intro-index', config.page?.index);
      document.querySelector('#project-list').replaceChildren(...(config.projects || []).map((project, index) => createProject(project, index, config.projectAction || 'Explorar projeto')));
      setText('#cta-label', config.cta?.label); setLines('#cta-title', config.cta?.headline); setAction('#cta-link', config.cta?.labelLink);
      document.querySelector('#cta-link').href = config.cta?.href || '/contato/';
      setText('#footer-studio', config.footer?.studio); setText('#footer-location', config.footer?.location); setText('#footer-copyright', config.footer?.copyright);
    } catch (error) { console.error(error); }
    setActiveNavigation(); enableExperience();
  };
  hydrate();
})();
