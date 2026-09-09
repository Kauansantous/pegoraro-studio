(() => {
  'use strict';

  const mobile = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let navigation = null;

  // Ignore query/hash, index.html and trailing slashes; the mobile presentation
  // belongs to Company Profile. Prefix matching also supports hosted subfolders.
  function normalize(pathname) {
    return pathname.replace(/\/index\.html$/i, '/')
      .replace(/\/+$/, '')
      .replace(/\/company-profile\/mobile$/i, '/company-profile') || '/';
  }

  function mount() {
    if (navigation || !mobile.matches) return;

    const legacyHeader = document.querySelector('.mobile-header');
    const legacyMenu = document.querySelector('.mobile-menu');
    const source = legacyMenu || document.querySelector('.desktop-nav');
    const sourceBrand = (legacyHeader || document.querySelector('.desktop-header'))?.querySelector('a');
    if (!source || !sourceBrand) return;

    if (legacyHeader && legacyMenu) {
      const legacyToggle = legacyHeader.querySelector('.menu-toggle');
      legacyToggle.classList.remove('is-open');
      legacyToggle.setAttribute('aria-expanded', 'false');
      legacyToggle.setAttribute('aria-label', 'Abrir menu');
      legacyMenu.classList.remove('is-open');
      legacyMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }

    const root = document.createElement('div');
    root.className = 'ps-mobile-nav';
    root.dataset.open = 'false';
    if (legacyHeader) root.dataset.inFlow = '';
    if (normalize(location.pathname).endsWith('/company-profile')) root.dataset.theme = 'white';
    root.innerHTML = `
      <header class="ps-nav-header" aria-label="Cabeçalho mobile">
        <a class="ps-nav-brand"></a>
        <button class="ps-nav-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="ps-mobile-menu">
          <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
      </header>
      <nav class="ps-nav-overlay" id="ps-mobile-menu" aria-label="Navegação principal" aria-hidden="true" inert>
        <div class="ps-nav-inner"><span class="ps-nav-indicator" aria-hidden="true"></span></div>
      </nav>`;

    const brand = root.querySelector('.ps-nav-brand');
    brand.href = sourceBrand.getAttribute('href');
    const sourceLogo = sourceBrand.querySelector('.brand-logo');
    if (sourceLogo) {
      const logo = sourceLogo.cloneNode(true);
      logo.setAttribute('aria-hidden', 'true');
      logo.alt = '';
      brand.classList.add('has-logo');
      brand.replaceChildren(logo);
    } else {
      brand.textContent = sourceBrand.textContent.trim();
    }
    brand.setAttribute('aria-label', 'Pegoraro Studio — Home');
    const toggle = root.querySelector('.ps-nav-toggle');
    const overlay = root.querySelector('.ps-nav-overlay');
    const inner = root.querySelector('.ps-nav-inner');
    const indicator = root.querySelector('.ps-nav-indicator');

    // Reuse each page's existing destinations, including relative paths.
    const links = [...source.querySelectorAll('a')].map((original, index) => {
      const link = document.createElement('a');
      link.className = 'ps-nav-link';
      link.setAttribute('href', original.getAttribute('href'));
      const number = document.createElement('span');
      number.className = 'ps-nav-number';
      number.textContent = String(index + 1).padStart(2, '0');
      number.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'ps-nav-label';
      const text = (original.querySelector('span:not(.menu-number)') || original).textContent.trim();
      label.textContent = text.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, letter => letter.toLocaleUpperCase('pt-BR'));
      link.style.setProperty('--nav-delay', `${index * 25}ms`);
      link.append(number, label);
      inner.insertBefore(link, indicator);
      return link;
    });

    // Keep the legacy mobile document untouched on desktop (including its own
    // listeners). Its nodes are parked only while the shared mobile UI is used.
    const parked = [legacyHeader, legacyMenu].filter(Boolean).map(node => {
      const marker = document.createComment('mobile navigation mount');
      node.replaceWith(marker);
      return { node, marker };
    });
    if (parked.length) parked[0].marker.before(root);
    else document.body.prepend(root);

    function updateScrollTone() {
      root.dataset.scrolled = String(window.scrollY > 16);
    }

    updateScrollTone();
    window.addEventListener('scroll', updateScrollTone, { passive: true });

    let active = null;
    let open = false;
    let closeTimer = 0;
    let locked = null;

    function moveIndicator(link) {
      indicator.dataset.visible = String(Boolean(link));
      if (!link) return;
      const label = link.querySelector('.ps-nav-label').getBoundingClientRect();
      const bounds = inner.getBoundingClientRect();
      indicator.style.setProperty('--nav-line-x', `${label.left - bounds.left}px`);
      indicator.style.setProperty('--nav-line-y', `${label.bottom - bounds.top + 5}px`);
      indicator.style.setProperty('--nav-line-width', `${label.width}px`);
    }

    function currentLink() {
      const current = normalize(location.pathname);
      const home = normalize(new URL(brand.href).pathname);
      active = links.filter(link => {
        const url = new URL(link.href);
        const route = normalize(url.pathname);
        return url.origin === location.origin &&
          (current === route || (route !== home && current.startsWith(`${route}/`)));
      }).sort((a, b) => b.pathname.length - a.pathname.length)[0] || null;
      links.forEach(link => {
        if (link === active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      moveIndicator(active);
    }

    function lockPage() {
      if (locked) return;
      const body = document.body;
      const properties = ['position', 'top', 'left', 'right', 'width', 'overflow'];
      locked = {
        x: window.scrollX,
        y: window.scrollY,
        styles: properties.map(name => [name, body.style.getPropertyValue(name), body.style.getPropertyPriority(name)]),
        background: [...body.children].filter(el => el !== root && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName)).map(el => [el, el.inert])
      };
      locked.background.forEach(([el]) => { el.inert = true; });
      Object.assign(body.style, { position: 'fixed', top: `${-locked.y}px`, left: `${-locked.x}px`, right: '0', width: '100%', overflow: 'hidden' });
    }

    function unlockPage() {
      if (!locked) return;
      const saved = locked;
      locked = null;
      saved.styles.forEach(([name, value, priority]) => {
        if (value) document.body.style.setProperty(name, value, priority);
        else document.body.style.removeProperty(name);
      });
      saved.background.forEach(([el, inert]) => { el.inert = inert; });
      // Bypass the page's existing smooth scroll while restoring its position.
      window.scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
    }

    function finishClose(restoreFocus, destination) {
      unlockPage();
      root.removeAttribute('role');
      root.removeAttribute('aria-modal');
      root.removeAttribute('aria-label');
      if (restoreFocus && root.isConnected) toggle.focus({ preventScroll: true });
      if (destination) window.location.assign(destination);
    }

    function closeMenu({ immediate = false, restoreFocus = true, destination = null } = {}) {
      window.clearTimeout(closeTimer);
      open = false;
      root.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      // Move focus before hiding its current container from assistive technology.
      if (overlay.contains(document.activeElement)) toggle.focus({ preventScroll: true });
      overlay.inert = true;
      overlay.setAttribute('aria-hidden', 'true');
      if (immediate || reducedMotion.matches) finishClose(restoreFocus, destination);
      else closeTimer = window.setTimeout(() => finishClose(restoreFocus, destination), 240);
    }

    function openMenu() {
      window.clearTimeout(closeTimer);
      lockPage();
      open = true;
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', 'Navegação principal');
      overlay.inert = false;
      overlay.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      currentLink();
      root.dataset.open = 'true';
      const firstFocus = active || links[0] || toggle;
      firstFocus.focus({ preventScroll: true });
      if (firstFocus !== toggle) {
        const bounds = firstFocus.getBoundingClientRect();
        const visible = overlay.getBoundingClientRect();
        if (bounds.bottom > visible.bottom) overlay.scrollTop += bounds.bottom - visible.bottom + 16;
        else if (bounds.top < visible.top) overlay.scrollTop -= visible.top - bounds.top + 16;
      }
    }

    function resetIndicator() {
      moveIndicator(links.find(link => link.contains(document.activeElement)) || active);
    }

    toggle.addEventListener('click', () => open ? closeMenu() : openMenu());
    overlay.addEventListener('click', event => {
      if (event.target === overlay || event.target === inner) closeMenu();
    });
    overlay.addEventListener('pointerleave', resetIndicator);
    links.forEach(link => {
      link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') moveIndicator(link); });
      link.addEventListener('pointerdown', () => moveIndicator(link));
      link.addEventListener('pointercancel', resetIndicator);
      link.addEventListener('focus', () => moveIndicator(link));
      link.addEventListener('blur', () => queueMicrotask(resetIndicator));
    });
    [...links, brand].forEach(link => link.addEventListener('click', event => {
      if (!open || event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        closeMenu();
        return;
      }
      event.preventDefault();
      closeMenu({ restoreFocus: false, destination: link.href });
    }));

    function onKeydown(event) {
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      } else if (event.key === 'Tab') {
        const focusable = [brand, toggle, ...links];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeydown);
    currentLink();

    navigation = {
      refresh: () => { currentLink(); if (open) resetIndicator(); },
      close: () => closeMenu({ immediate: true, restoreFocus: false }),
      destroy() {
        closeMenu({ immediate: true, restoreFocus: false });
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('scroll', updateScrollTone);
        root.remove();
        parked.forEach(({ node, marker }) => marker.replaceWith(node));
      }
    };
  }

  function syncViewport() {
    if (mobile.matches) mount();
    else if (navigation) {
      navigation.destroy();
      navigation = null;
    }
  }

  mobile.addEventListener('change', syncViewport);
  window.addEventListener('resize', () => navigation?.refresh());
  window.addEventListener('popstate', () => navigation?.refresh());
  window.addEventListener('pageshow', () => { syncViewport(); navigation?.close(); navigation?.refresh(); });
  window.addEventListener('pagehide', () => navigation?.close());
  syncViewport();
})();
