/* ============================================================
   Job Notification Tracker — Router & Navigation
   ============================================================
   Hash-based SPA routing. No frameworks. No dependencies.
   ============================================================ */

(function () {
  'use strict';

  /* ── Route Configuration ───────────────────────────────── */

  var routes = {
    '/': { title: 'Dashboard', redirect: '/dashboard' },
    '/dashboard': { title: 'Dashboard' },
    '/saved': { title: 'Saved' },
    '/digest': { title: 'Digest' },
    '/settings': { title: 'Settings' },
    '/proof': { title: 'Proof' }
  };

  /* ── DOM References ────────────────────────────────────── */

  var app;
  var navLinks;
  var hamburger;
  var navLinksContainer;

  /* ── Render Page ────────────────────────────────────────── */

  function renderPage(title) {
    app.innerHTML =
      '<div class="route-page">' +
      '<h1 class="route-page__heading">' + title + '</h1>' +
      '<p class="route-page__subtext">This section will be built in the next step.</p>' +
      '</div>';

    document.title = title + ' — Job Notification Tracker';
  }

  /* ── Update Active Link ────────────────────────────────── */

  function updateActiveLink(currentRoute) {
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      if (link.getAttribute('data-route') === currentRoute) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    }
  }

  /* ── Router ────────────────────────────────────────────── */

  function navigate() {
    var hash = window.location.hash.replace('#', '') || '/';
    var route = routes[hash];

    /* Unknown route → default to dashboard */
    if (!route) {
      window.location.hash = '#/dashboard';
      return;
    }

    /* Handle redirect (e.g. / → /dashboard) */
    if (route.redirect) {
      window.location.hash = '#' + route.redirect;
      return;
    }

    renderPage(route.title);
    updateActiveLink(hash);

    /* Close mobile menu after navigation */
    if (navLinksContainer) {
      navLinksContainer.classList.remove('nav__links--open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  /* ── Hamburger Toggle ──────────────────────────────────── */

  function initHamburger() {
    hamburger = document.getElementById('nav-hamburger');
    navLinksContainer = document.getElementById('nav-links');

    if (!hamburger || !navLinksContainer) return;

    hamburger.addEventListener('click', function () {
      var isOpen = navLinksContainer.classList.toggle('nav__links--open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.classList.toggle('nav__hamburger--active', isOpen);
    });
  }

  /* ── Initialize ────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    app = document.getElementById('app');
    navLinks = document.querySelectorAll('.nav__link');

    initHamburger();

    /* Listen for hash changes */
    window.addEventListener('hashchange', navigate);

    /* Initial route */
    navigate();
  });

})();
