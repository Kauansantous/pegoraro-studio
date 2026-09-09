(function () {
  "use strict";

  const nav = document.querySelector(".company-profile-sections-nav");
  const sections = Array.from(document.querySelectorAll(".page[data-section-title]"));

  if (!nav || !sections.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const track = document.createElement("div");
  const links = new Map();
  let activeId = "";
  let scrollFrame = 0;
  let suppressPassiveHashUntil = 0;
  let pendingNavigationId = "";
  let pendingNavigationExpires = 0;

  track.className = "company-profile-sections-nav__track";

  sections.forEach(function (section) {
    const link = document.createElement("a");
    link.className = "company-profile-sections-nav__link";
    link.href = "#" + section.id;
    link.textContent = section.dataset.sectionTitle;
    link.dataset.sectionLink = section.id;
    track.appendChild(link);
    links.set(section.id, link);
  });

  nav.appendChild(track);
  nav.classList.add("is-ready");

  function getHeaderOffset() {
    const header = document.querySelector(".ps-nav-header, .desktop-header, .mobile-header");
    if (!header) return 0;

    const styles = window.getComputedStyle(header);
    return styles.display === "none" ? 0 : header.getBoundingClientRect().height;
  }

  function setUrlHash(id, mode) {
    if (!id || window.location.hash === "#" + id) return;

    const url = new URL(window.location.href);
    url.hash = id;
    window.history[mode + "State"](null, "", url.pathname + url.search + url.hash);
  }

  function centerActiveLink(link, behavior) {
    const left = link.offsetLeft - ((track.clientWidth - link.offsetWidth) / 2);
    track.scrollTo({
      left: Math.max(0, left),
      behavior: behavior
    });
  }

  function setActive(id, centerBehavior) {
    if (!id || activeId === id) return;

    activeId = id;
    links.forEach(function (link, linkId) {
      const isActive = linkId === id;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const activeLink = links.get(id);
    if (activeLink) centerActiveLink(activeLink, centerBehavior || "auto");
  }

  function scrollToSection(section, behavior) {
    const top = section.getBoundingClientRect().top
      + window.scrollY
      - getHeaderOffset()
      - 10;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: behavior
    });
  }

  function syncActiveSection(updateHash) {
    const probe = window.scrollY + getHeaderOffset() + Math.min(window.innerHeight * 0.2, 150);
    let visibleSection = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= probe) visibleSection = section;
    });

    const sectionForButton = visibleSection || sections[0];
    const nextId = sectionForButton.id;
    const changed = nextId !== activeId;

    if (pendingNavigationId) {
      const pendingSection = document.getElementById(pendingNavigationId);
      const expectedTop = getHeaderOffset() + 10;
      const reachedTarget = pendingSection
        && Math.abs(pendingSection.getBoundingClientRect().top - expectedTop) < 4;

      if (reachedTarget || window.performance.now() > pendingNavigationExpires) {
        pendingNavigationId = "";
      }
    }

    setActive(nextId, changed && !reduceMotion.matches ? "smooth" : "auto");

    if (
      updateHash
      && visibleSection
      && !pendingNavigationId
      && window.performance.now() >= suppressPassiveHashUntil
    ) {
      setUrlHash(nextId, "replace");
    }
  }

  nav.addEventListener("click", function (event) {
    const link = event.target.closest("[data-section-link]");
    if (!link) return;

    const section = document.getElementById(link.dataset.sectionLink);
    if (!section) return;

    event.preventDefault();

    const behavior = reduceMotion.matches ? "auto" : "smooth";
    suppressPassiveHashUntil = window.performance.now() + (behavior === "smooth" ? 900 : 0);
    pendingNavigationId = section.id;
    pendingNavigationExpires = window.performance.now() + (behavior === "smooth" ? 4000 : 250);
    setUrlHash(section.id, "push");
    setActive(section.id, behavior);
    scrollToSection(section, behavior);
  });

  window.addEventListener("scroll", function () {
    if (scrollFrame) return;

    scrollFrame = window.requestAnimationFrame(function () {
      scrollFrame = 0;
      syncActiveSection(true);
    });
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);

    scrollFrame = window.requestAnimationFrame(function () {
      scrollFrame = 0;
      syncActiveSection(false);
    });
  }, { passive: true });

  window.addEventListener("popstate", function () {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const section = id ? document.getElementById(id) : null;

    if (!section || !links.has(id)) return;

    suppressPassiveHashUntil = window.performance.now() + 100;
    pendingNavigationId = id;
    pendingNavigationExpires = window.performance.now() + 250;
    setActive(id, "auto");
    window.requestAnimationFrame(function () {
      scrollToSection(section, "auto");
    });
  });

  function restoreHashTarget() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const section = id ? document.getElementById(id) : null;

    if (section && links.has(id)) {
      setActive(id, "auto");
      scrollToSection(section, "auto");
    } else {
      syncActiveSection(false);
    }
  }

  restoreHashTarget();

  if (document.readyState !== "complete") {
    window.addEventListener("load", restoreHashTarget, { once: true });
  }
}());
