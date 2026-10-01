(() => {
  'use strict';

  const measurementId = 'G-8QCVEVK950';
  const consentKey = 'pegoraro-analytics-consent';
  let analyticsLoaded = false;

  const loadAnalytics = () => {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(tag);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  };

  const track = (name, params = {}) => {
    if (localStorage.getItem(consentKey) !== 'granted') return;
    loadAnalytics();
    window.gtag('event', name, params);
  };

  const setConsent = (value) => {
    localStorage.setItem(consentKey, value);
    document.documentElement.classList.remove('analytics-consent-pending');
    if (value === 'granted') loadAnalytics();
  };

  const createBanner = () => {
    if (localStorage.getItem(consentKey)) return;
    document.documentElement.classList.add('analytics-consent-pending');
    const banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferências de cookies');
    banner.innerHTML = `
      <p>Usamos métricas anônimas para entender como o site é utilizado e aprimorar a experiência.</p>
      <div class="analytics-consent__actions">
        <button type="button" data-analytics-consent="denied">Recusar</button>
        <button type="button" data-analytics-consent="granted">Aceitar</button>
      </div>`;
    banner.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-analytics-consent]')?.dataset.analyticsConsent;
      if (!choice) return;
      setConsent(choice);
      banner.remove();
    });
    document.body.append(banner);
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.href;
    if (href.startsWith('mailto:')) track('contact_click', { method: 'email' });
    else if (/wa\.me|whatsapp\.com/i.test(href)) track('contact_click', { method: 'whatsapp' });
    else if (/instagram\.com/i.test(href)) track('contact_click', { method: 'instagram' });
    else if (/\.pdf(?:$|[?#])/i.test(href)) track('file_download', { file_name: href.split('/').pop().split('?')[0] });
    else if (/\/briefing-do-imovel\/?(?:[?#]|$)/i.test(href)) track('briefing_start');
  });

  document.addEventListener('submit', (event) => {
    if (event.target.matches('#briefing-form')) track('briefing_submit');
  }, true);

  if (localStorage.getItem(consentKey) === 'granted') loadAnalytics();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createBanner, { once: true });
  else createBanner();
})();
