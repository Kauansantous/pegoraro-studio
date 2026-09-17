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
  const createChannel = (channel, index) => {
    const link = document.createElement('a');
    link.className = 'contact-option'; link.href = channel.href || '#';
    link.setAttribute('aria-label', `${channel.label}: ${channel.value}`);
    if (channel.external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    const number = document.createElement('span'); number.className = 'contact-number'; number.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span'); label.className = 'contact-label'; label.textContent = channel.label || '';
    const title = document.createElement('h2'); title.textContent = channel.value || '';
    const main = document.createElement('div'); main.className = 'contact-main'; main.append(label, title);
    const arrow = document.createElement('span'); arrow.className = 'contact-arrow'; arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
    link.append(number, main, arrow); return link;
  };
  const setActiveNavigation = () => {
    const current = window.location.pathname.replace(/\/$/, '');
    document.querySelectorAll('.desktop-nav a').forEach(link => {
      if (new URL(link.href).pathname.replace(/\/$/, '') === current) link.classList.add('active');
    });
  };
  const enableExperience = () => {
    const root = document.documentElement;
    const updateProgress = () => {
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--contact-progress', max > 0 ? `${window.scrollY / max}` : '0');
    };
    updateProgress(); window.addEventListener('scroll', updateProgress, { passive: true });
    const targets = document.querySelectorAll('.contact-hero > *, .contact-option, .contact-closing, .site-footer');
    if (!('IntersectionObserver' in window)) return targets.forEach(target => target.classList.add('is-visible'));
    const observer = new IntersectionObserver((entries, instance) => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); instance.unobserve(entry.target);
    }), { threshold: .12 });
    targets.forEach(target => observer.observe(target));
  };
  const hydrate = async () => {
    try {
      const response = await fetch('./contato.json');
      if (!response.ok) throw new Error('Configuração de contato indisponível.');
      const config = await response.json();
      document.title = config.page?.title || document.title;
      setText('#contact-label', config.page?.label); setLines('#contact-title', config.page?.headline);
      setText('#contact-intro', config.page?.intro);
      document.querySelector('#contact-list').replaceChildren(...(config.channels || []).map(createChannel));
      setText('#closing-label', config.closing?.label); setLines('#closing-title', config.closing?.headline);
      setText('#footer-studio', config.footer?.studio); setText('#footer-location', config.footer?.location); setText('#footer-copyright', config.footer?.copyright);
    } catch (error) { console.error(error); }
    setActiveNavigation(); enableExperience();
  };
  hydrate();
})();
