/* ============================================================
   Job Notification Tracker — Router & Page Renderers
   ============================================================
   Hash-based SPA routing. No frameworks. No dependencies.
   Each route has a dedicated render function.
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM References ────────────────────────────────────── */

  var app;
  var navLinks;
  var hamburger;
  var navLinksContainer;

  /* ══════════════════════════════════════════════════════════
     PAGE RENDERERS
     ══════════════════════════════════════════════════════════ */

  /* ── Landing Page (/) ──────────────────────────────────── */

  function renderLanding() {
    app.className = 'route-container route-container--centered';

    app.innerHTML =
      '<section class="landing-hero">' +
      '<h1 class="landing-hero__headline">Stop Missing The Right Jobs.</h1>' +
      '<p class="landing-hero__subtext">' +
      'Precision-matched job discovery delivered daily at 9AM.' +
      '</p>' +
      '<a href="#/settings" class="btn btn--primary landing-hero__cta">Start Tracking</a>' +
      '</section>';

    document.title = 'Job Notification Tracker — KodNest';
  }

  /* ── Dashboard (/dashboard) ────────────────────────────── */

  function renderDashboard() {
    app.className = 'route-container route-container--top';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Dashboard</h2>' +
      '<p class="page-section__desc">Your matched job notifications appear here.</p>' +
      '</div>' +
      '<div class="state-empty">' +
      '<svg class="state-empty__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" stroke-width="2"/>' +
      '<line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" stroke-width="2"/>' +
      '<circle cx="12" cy="14" r="1.5" fill="currentColor"/>' +
      '<circle cx="17" cy="14" r="1.5" fill="currentColor"/>' +
      '<circle cx="22" cy="14" r="1.5" fill="currentColor"/>' +
      '</svg>' +
      '<h3 class="state-empty__title">No jobs yet.</h3>' +
      '<p class="state-empty__message">' +
      'In the next step, you will load a realistic dataset.' +
      '</p>' +
      '</div>' +
      '</div>';

    document.title = 'Dashboard — Job Notification Tracker';
  }

  /* ── Settings (/settings) ──────────────────────────────── */

  function renderSettings() {
    app.className = 'route-container route-container--top';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Settings</h2>' +
      '<p class="page-section__desc">Configure your job tracking preferences.</p>' +
      '</div>' +
      '<div class="card settings-form">' +

      '<div class="field">' +
      '<label class="label" for="setting-keywords">Role Keywords</label>' +
      '<input class="input" type="text" id="setting-keywords" placeholder="e.g. Frontend Engineer, React Developer">' +
      '<p class="field__hint">Comma-separated roles you\'re targeting.</p>' +
      '</div>' +

      '<div class="field">' +
      '<label class="label" for="setting-locations">Preferred Locations</label>' +
      '<input class="input" type="text" id="setting-locations" placeholder="e.g. Bangalore, Remote, Mumbai">' +
      '<p class="field__hint">Cities or regions you\'d consider.</p>' +
      '</div>' +

      '<div class="field">' +
      '<label class="label" for="setting-mode">Work Mode</label>' +
      '<select class="input" id="setting-mode">' +
      '<option value="" disabled selected>Select mode</option>' +
      '<option value="remote">Remote</option>' +
      '<option value="hybrid">Hybrid</option>' +
      '<option value="onsite">Onsite</option>' +
      '</select>' +
      '</div>' +

      '<div class="field">' +
      '<label class="label" for="setting-experience">Experience Level</label>' +
      '<select class="input" id="setting-experience">' +
      '<option value="" disabled selected>Select level</option>' +
      '<option value="entry">Entry Level</option>' +
      '<option value="mid">Mid Level</option>' +
      '<option value="senior">Senior</option>' +
      '<option value="lead">Lead / Staff</option>' +
      '</select>' +
      '</div>' +

      '<hr class="divider">' +

      '<button class="btn btn--primary btn--block" disabled>Save Preferences</button>' +
      '<p class="field__hint" style="text-align:center;margin-top:8px;">Preference logic will be implemented in a future step.</p>' +

      '</div>' +
      '</div>';

    document.title = 'Settings — Job Notification Tracker';
  }

  /* ── Saved (/saved) ────────────────────────────────────── */

  function renderSaved() {
    app.className = 'route-container route-container--top';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Saved Jobs</h2>' +
      '<p class="page-section__desc">Your bookmarked opportunities in one place.</p>' +
      '</div>' +
      '<div class="state-empty">' +
      '<svg class="state-empty__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M14 6h20a2 2 0 0 1 2 2v34l-12-8-12 8V8a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
      '</svg>' +
      '<h3 class="state-empty__title">No saved jobs.</h3>' +
      '<p class="state-empty__message">' +
      'Jobs you bookmark will appear here for quick access.' +
      '</p>' +
      '</div>' +
      '</div>';

    document.title = 'Saved — Job Notification Tracker';
  }

  /* ── Digest (/digest) ──────────────────────────────────── */

  function renderDigest() {
    app.className = 'route-container route-container--top';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Daily Digest</h2>' +
      '<p class="page-section__desc">A curated summary delivered every morning at 9 AM.</p>' +
      '</div>' +
      '<div class="state-empty">' +
      '<svg class="state-empty__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" stroke-width="2"/>' +
      '<line x1="15" y1="14" x2="33" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="15" y1="20" x2="33" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="15" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>' +
      '<h3 class="state-empty__title">No digest yet.</h3>' +
      '<p class="state-empty__message">' +
      'Your daily 9 AM digest will appear here once tracking begins.' +
      '</p>' +
      '</div>' +
      '</div>';

    document.title = 'Digest — Job Notification Tracker';
  }

  /* ── Proof (/proof) ────────────────────────────────────── */

  function renderProof() {
    app.className = 'route-container route-container--top';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Proof of Work</h2>' +
      '<p class="page-section__desc">Artifacts and build evidence collected during development.</p>' +
      '</div>' +
      '<div class="state-empty">' +
      '<svg class="state-empty__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M24 4l6 12h14l-11 8 4 14-13-9-13 9 4-14L4 16h14z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
      '</svg>' +
      '<h3 class="state-empty__title">No artifacts yet.</h3>' +
      '<p class="state-empty__message">' +
      'Screenshots, logs, and build proof will be collected here as the project evolves.' +
      '</p>' +
      '</div>' +
      '</div>';

    document.title = 'Proof — Job Notification Tracker';
  }

  /* ══════════════════════════════════════════════════════════
     ROUTE TABLE
     ══════════════════════════════════════════════════════════ */

  var routes = {
    '/': { title: 'Home', render: renderLanding },
    '/dashboard': { title: 'Dashboard', render: renderDashboard },
    '/saved': { title: 'Saved', render: renderSaved },
    '/digest': { title: 'Digest', render: renderDigest },
    '/settings': { title: 'Settings', render: renderSettings },
    '/proof': { title: 'Proof', render: renderProof }
  };

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

    route.render();
    updateActiveLink(hash);

    /* Close mobile menu after navigation */
    if (navLinksContainer) {
      navLinksContainer.classList.remove('nav__links--open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('nav__hamburger--active');
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
