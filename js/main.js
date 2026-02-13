/* ============================================================
   Job Notification Tracker — Router & Rendering Logic
   ============================================================ */

(function () {
  'use strict';

  /* ── State & Refs ──────────────────────────────────────── */

  var app;
  var modalRoot;
  var navLinks;
  var hamburger;
  var navLinksContainer;
  var savedJobs = new Set(); /* Stores IDs as strings */

  // Search State
  var currentFilters = {
    search: '',
    location: 'Any',
    mode: 'Any',
    experience: 'Any'
  };

  /* ── Icons ─────────────────────────────────────────────── */

  var icons = {
    location: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    briefcase: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    money: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    external: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
  };

  /* ── Helper Functions ──────────────────────────────────── */

  function loadSavedJobs() {
    try {
      var saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      savedJobs = new Set(saved);
    } catch (e) {
      console.error('Failed to load saved jobs', e);
      savedJobs = new Set();
    }
  }

  function toggleSaveJob(id, btnElement) {
    if (savedJobs.has(id)) {
      savedJobs.delete(id);
      if (btnElement) {
        btnElement.classList.replace('btn--primary', 'btn--secondary');
        btnElement.innerHTML = icons.save + ' Save';
      }
    } else {
      savedJobs.add(id);
      if (btnElement) {
        btnElement.classList.replace('btn--secondary', 'btn--primary');
        btnElement.innerHTML = icons.check + ' Saved';
      }
    }
    localStorage.setItem('savedJobs', JSON.stringify(Array.from(savedJobs)));

    // If on /saved page, re-render to remove unsaved item
    if (window.location.hash === '#/saved') {
      renderSaved();
    }
  }

  function openModal(job) {
    modalRoot.innerHTML =
      '<div class="modal-overlay" id="modal-overlay">' +
      '<div class="modal">' +
      '<div class="modal__header">' +
      '<h3 class="modal__title">' + job.title + '</h3>' +
      '<button class="modal__close" id="modal-close">' + icons.close + '</button>' +
      '</div>' +
      '<div class="modal__content">' +
      '<div class="modal__section">' +
      '<div class="modal__section-title">Company Info</div>' +
      '<p><strong>' + job.company + '</strong> • ' + job.location + ' (' + job.mode + ')</p>' +
      '<p>Posted ' + job.postedDaysAgo + ' days ago via ' + job.source + '</p>' +
      '</div>' +
      '<div class="modal__section">' +
      '<div class="modal__section-title">Job Description</div>' +
      '<p>' + job.description + '</p>' +
      '</div>' +
      '<div class="modal__section">' +
      '<div class="modal__section-title">Skills Required</div>' +
      '<div class="job-card__tags">' +
      job.skills.map(function (s) { return '<span class="badge badge--neutral">' + s + '</span>'; }).join('') +
      '</div>' +
      '</div>' +
      '<div class="modal__section">' +
      '<div class="modal__section-title">Details</div>' +
      '<p>Experience: ' + job.experience + '</p>' +
      '<p>Salary: ' + job.salaryRange + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="modal__footer">' +
      '<button class="btn btn--ghost" id="modal-close-btn">Close</button>' +
      '<a href="' + job.applyUrl + '" target="_blank" class="btn btn--primary">Apply Now ' + icons.external + '</a>' +
      '</div>' +
      '</div>' +
      '</div>';

    // Modal Event Listeners
    document.getElementById('modal-close').onclick = closeModal;
    document.getElementById('modal-close-btn').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = function (e) {
      if (e.target === this) closeModal();
    };

    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalRoot.innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ── Search Logic ──────────────────────────────────────── */

  function filterJobs() {
    if (!window.JOB_DATA) return [];

    var term = currentFilters.search.toLowerCase();

    return window.JOB_DATA.filter(function (job) {
      // 1. Text Search
      var matchesSearch = true;
      if (term) {
        var text = (job.title + ' ' + job.company + ' ' + (job.skills || []).join(' ')).toLowerCase();
        matchesSearch = text.indexOf(term) !== -1;
      }

      // 2. Dropdowns
      var matchesLoc = currentFilters.location === 'Any' || job.location.includes(currentFilters.location);
      var matchesMode = currentFilters.mode === 'Any' || job.mode === currentFilters.mode;

      // Experience Matching (Simple string match for now)
      var matchesExp = true;
      if (currentFilters.experience !== 'Any') {
        if (currentFilters.experience === 'Fresher') {
          matchesExp = job.experience === 'Fresher';
        } else if (currentFilters.experience === '0-2 Years') {
          // Includes Fresher, 0-1, 1-2, 1-3
          matchesExp = job.experience === 'Fresher' || job.experience.startsWith('0') || job.experience.startsWith('1');
        }
      }

      return matchesSearch && matchesLoc && matchesMode && matchesExp;
    });
  }

  function handleSearchInput() {
    var searchInput = document.getElementById('search-input');
    var locSelect = document.getElementById('filter-loc');
    var modeSelect = document.getElementById('filter-mode');
    var expSelect = document.getElementById('filter-exp');

    if (searchInput) currentFilters.search = searchInput.value;
    if (locSelect) currentFilters.location = locSelect.value;
    if (modeSelect) currentFilters.mode = modeSelect.value;
    if (expSelect) currentFilters.experience = expSelect.value;

    // Re-render Job List Only (Optimization)
    var jobContainer = document.getElementById('job-list-container');
    if (jobContainer) {
      var filtered = filterJobs();
      if (filtered.length === 0) {
        jobContainer.innerHTML = '<div class="state-empty" style="grid-column: 1/-1"><h3 class="state-empty__title">No jobs found.</h3><p class="state-empty__message">Try adjusting your filters.</p></div>';
      } else {
        jobContainer.innerHTML = filtered.map(renderJobCard).join('');
      }
    }
  }

  /* ── Render Components ─────────────────────────────────── */

  function renderJobCard(job) {
    var isSaved = savedJobs.has(job.id);
    var saveBtnClass = isSaved ? 'btn--primary' : 'btn--secondary';
    var saveBtnText = isSaved ? (icons.check + ' Saved') : (icons.save + ' Save');

    return (
      '<article class="job-card" data-id="' + job.id + '">' +
      '<div class="job-card__header">' +
      '<div>' +
      '<h3 class="job-card__title">' + job.title + '</h3>' +
      '<div class="job-card__company">' + job.company + '</div>' +
      '</div>' +
      '<span class="badge badge--neutral">' + job.postedDaysAgo + 'd ago</span>' +
      '</div>' +

      '<div class="job-card__meta">' +
      '<span>' + icons.location + ' ' + job.location + ' (' + job.mode + ')</span>' +
      '<span>' + icons.briefcase + ' ' + job.experience + '</span>' +
      '</div>' +

      '<div class="job-card__tags">' +
      '<span class="badge badge--neutral">' + icons.money + ' ' + job.salaryRange + '</span>' +
      '<span class="badge badge--success">' + job.source + '</span>' +
      '</div>' +

      '<div class="job-card__actions">' +
      '<button class="btn btn--ghost btn--sm action-view" data-id="' + job.id + '">View Details</button>' +
      '<button class="btn ' + saveBtnClass + ' btn--sm action-save" data-id="' + job.id + '">' + saveBtnText + '</button>' +
      '<a href="' + job.applyUrl + '" target="_blank" class="btn btn--ghost btn--sm">Apply ' + icons.external + '</a>' +
      '</div>' +
      '</article>'
    );
  }

  function renderFilterBar() {
    return (
      '<div class="filter-bar">' +
      '<input type="text" id="search-input" class="input filter-bar__search" placeholder="Search role, company or skills..." value="' + currentFilters.search + '">' +

      '<select id="filter-loc" class="input filter-bar__select">' +
      '<option value="Any" ' + (currentFilters.location === 'Any' ? 'selected' : '') + '>Location: Any</option>' +
      '<option value="Bangalore" ' + (currentFilters.location === 'Bangalore' ? 'selected' : '') + '>Bangalore</option>' +
      '<option value="Remote" ' + (currentFilters.location === 'Remote' ? 'selected' : '') + '>Remote</option>' +
      '<option value="Hyderabad" ' + (currentFilters.location === 'Hyderabad' ? 'selected' : '') + '>Hyderabad</option>' +
      '</select>' +

      '<select id="filter-mode" class="input filter-bar__select">' +
      '<option value="Any" ' + (currentFilters.mode === 'Any' ? 'selected' : '') + '>Mode: Any</option>' +
      '<option value="Remote" ' + (currentFilters.mode === 'Remote' ? 'selected' : '') + '>Remote</option>' +
      '<option value="Hybrid" ' + (currentFilters.mode === 'Hybrid' ? 'selected' : '') + '>Hybrid</option>' +
      '<option value="Onsite" ' + (currentFilters.mode === 'Onsite' ? 'selected' : '') + '>Onsite</option>' +
      '</select>' +

      '<select id="filter-exp" class="input filter-bar__select">' +
      '<option value="Any" ' + (currentFilters.experience === 'Any' ? 'selected' : '') + '>Exp: Any</option>' +
      '<option value="Fresher" ' + (currentFilters.experience === 'Fresher' ? 'selected' : '') + '>Fresher</option>' +
      '<option value="0-2 Years" ' + (currentFilters.experience === '0-2 Years' ? 'selected' : '') + '>0-2 Years</option>' +
      '</select>' +

      '<button id="search-btn" class="btn btn--primary filter-bar__btn">' + icons.search + ' Search</button>' +
      '</div>'
    );
  }

  /* ── Page Renderers ────────────────────────────────────── */

  function renderLanding() {
    app.className = 'route-container route-container--centered';
    app.innerHTML =
      '<section class="landing-hero">' +
      '<h1 class="landing-hero__headline">Stop Missing The Right Jobs.</h1>' +
      '<p class="landing-hero__subtext">Precision-matched job discovery delivered daily at 9AM.</p>' +
      '<a href="#/dashboard" class="btn btn--primary landing-hero__cta">Start Tracking</a>' +
      '</section>';
    document.title = 'Job Notification Tracker — KodNest';
  }

  function renderDashboard() {
    app.className = 'route-container route-container--top';

    var filteredJobs = filterJobs();
    var jobsHtml = filteredJobs.length > 0
      ? filteredJobs.map(renderJobCard).join('')
      : '<div class="state-empty" style="grid-column: 1/-1"><h3 class="state-empty__title">No jobs found.</h3></div>';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Dashboard</h2>' +
      '<p class="page-section__desc">Browse and track new opportunities.</p>' +
      '</div>' +
      renderFilterBar() +
      '<div id="job-list-container" class="job-grid">' +
      jobsHtml +
      '</div>' +
      '</div>';

    document.title = 'Dashboard — Job Notification Tracker';
  }

  function renderSaved() {
    app.className = 'route-container route-container--top';

    var savedList = window.JOB_DATA.filter(function (job) {
      return savedJobs.has(job.id);
    });

    var contentHtml;
    if (savedList.length === 0) {
      contentHtml =
        '<div class="state-empty">' +
        '<svg class="state-empty__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M14 6h20a2 2 0 0 1 2 2v34l-12-8-12 8V8a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
        '</svg>' +
        '<h3 class="state-empty__title">No saved jobs.</h3>' +
        '<p class="state-empty__message">Jobs you save will appear here for quick access.</p>' +
        '<a href="#/dashboard" class="btn btn--primary">Browse Jobs</a>' +
        '</div>';
    } else {
      contentHtml = '<div class="job-grid">' + savedList.map(renderJobCard).join('') + '</div>';
    }

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Saved Jobs</h2>' +
      '<p class="page-section__desc">Your bookmarked opportunities.</p>' +
      '</div>' +
      contentHtml +
      '</div>';

    document.title = 'Saved — Job Notification Tracker';
  }

  /* ── Other Renderers (Unchanged) ───────────────────────── */

  function renderDigest() {
    app.className = 'route-container route-container--top';
    app.innerHTML = '<div class="page-section"><div class="page-section__header"><h2 class="page-section__title">Daily Digest</h2><p class="page-section__desc">A curated summary delivered every morning at 9 AM.</p></div><div class="state-empty"><svg class="state-empty__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" stroke-width="2"/><line x1="15" y1="14" x2="33" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="20" x2="33" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><h3 class="state-empty__title">No digest yet.</h3><p class="state-empty__message">Your daily 9 AM digest will appear here once tracking begins.</p></div></div>';
    document.title = 'Digest — Job Notification Tracker';
  }

  function renderSettings() {
    app.className = 'route-container route-container--top';
    app.innerHTML = '<div class="page-section"><div class="page-section__header"><h2 class="page-section__title">Settings</h2><p class="page-section__desc">Configure your job tracking preferences.</p></div><div class="card settings-form"><div class="field"><label class="label">Role Keywords</label><input class="input" placeholder="e.g. Frontend Engineer"></div><div class="field"><label class="label">Locations</label><input class="input" placeholder="e.g. Bangalore"></div><button class="btn btn--primary btn--block" disabled>Save Preferences</button></div></div>';
    document.title = 'Settings — Job Notification Tracker';
  }

  function renderProof() {
    app.className = 'route-container route-container--top';
    app.innerHTML = '<div class="page-section"><div class="page-section__header"><h2 class="page-section__title">Proof of Work</h2></div><div class="state-empty"><h3 class="state-empty__title">Artifacts</h3><p class="state-empty__message">Collection area.</p></div></div>';
    document.title = 'Proof — Job Notification Tracker';
  }

  /* ── Router & Init ─────────────────────────────────────── */

  var routes = {
    '/': { title: 'Home', render: renderLanding },
    '/dashboard': { title: 'Dashboard', render: renderDashboard },
    '/saved': { title: 'Saved', render: renderSaved },
    '/digest': { title: 'Digest', render: renderDigest },
    '/settings': { title: 'Settings', render: renderSettings },
    '/proof': { title: 'Proof', render: renderProof }
  };

  function updateActiveLink(hash) {
    if (!navLinks) return;
    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      if (link.getAttribute('data-route') === hash) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    }
  }

  function navigate() {
    var hash = window.location.hash.replace('#', '') || '/';
    var route = routes[hash];
    if (!route) { window.location.hash = '#/dashboard'; return; }

    // Close modal on nav change
    if (modalRoot) modalRoot.innerHTML = '';

    route.render();
    updateActiveLink(hash);

    if (navLinksContainer) {
      navLinksContainer.classList.remove('nav__links--open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  /* ── Event Delegation ──────────────────────────────────── */

  function handleAppClick(e) {
    var target = e.target;

    // Handle "View Details"
    if (target.classList.contains('action-view')) {
      var id = target.getAttribute('data-id');
      var job = window.JOB_DATA.find(function (j) { return j.id === id; });
      if (job) openModal(job);
    }

    // Handle "Save" button
    if (target.classList.contains('action-save')) {
      var id = target.getAttribute('data-id');
      toggleSaveJob(id, target);
    }

    // Handle "Search" button
    if (target.id === 'search-btn') {
      handleSearchInput();
    }
  }

  // Handle Enter key in Search Input
  function handleAppKeydown(e) {
    if (e.target.id === 'search-input' && e.key === 'Enter') {
      handleSearchInput();
    }
  }

  // Handle Filter Changes
  function handleAppChange(e) {
    if (e.target.classList.contains('filter-bar__select')) {
      handleSearchInput();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    app = document.getElementById('app');
    modalRoot = document.getElementById('modal-root');
    navLinks = document.querySelectorAll('.nav__link');
    hamburger = document.getElementById('nav-hamburger');
    navLinksContainer = document.getElementById('nav-links');

    loadSavedJobs();

    // Hamburger Logic
    if (hamburger && navLinksContainer) {
      hamburger.addEventListener('click', function () {
        var isOpen = navLinksContainer.classList.toggle('nav__links--open');
        hamburger.setAttribute('aria-expanded', isOpen);
      });
    }

    // Global Event Delegations
    app.addEventListener('click', handleAppClick);
    app.addEventListener('keydown', handleAppKeydown);
    app.addEventListener('change', handleAppChange);

    window.addEventListener('hashchange', navigate);
    navigate();
  });

})();
