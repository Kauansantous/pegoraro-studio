(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const reportSections = document.querySelectorAll('.intro, .document-heading, .report-cta, .site-footer');

  const updateScrollState = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    body.style.setProperty('--report-progress', max > 0 ? `${window.scrollY / max}` : '0');
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  const reveal = (element) => {
    element.classList.add('report-reveal');
    requestAnimationFrame(() => element.classList.add('is-visible'));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    reportSections.forEach((section) => observer.observe(section));

    const viewer = document.querySelector('#report-viewer');
    if (viewer) {
      const sheetObserver = new MutationObserver(() => {
        viewer.querySelectorAll('.pdf-sheet:not(.report-reveal)').forEach((sheet) => {
          sheet.classList.add('report-reveal');
          sheetObserver.observe(sheet, { attributes: true });
          requestAnimationFrame(() => sheet.classList.add('is-visible'));
        });
      });
      sheetObserver.observe(viewer, { childList: true });
    }
  } else {
    reportSections.forEach(reveal);
  }
})();
