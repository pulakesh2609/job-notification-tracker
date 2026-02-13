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
  var savedJobs = new Set();

  // Search State
  var currentFilters = {
    search: '',
    location: 'Any',
    mode: 'Any',
    experience: 'Any',
    sort: 'Latest',
    showMatchesOnly: false
  };

  // User Preferences (Default)
  var preferences = {
    roleKeywords: [],
    locations: [],
    modes: [],
    experience: 'Any',
    skills: [],
    minMatchScore: 40
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
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
  };

  /* ── Helper Functions ──────────────────────────────────── */

  function loadData() {
    try {
      var saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      savedJobs = new Set(saved);

      var prefs = JSON.parse(localStorage.getItem('jobTrackerPreferences'));
      if (prefs) preferences = prefs;
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }

  function savePreferences() {
    localStorage.setItem('jobTrackerPreferences', JSON.stringify(preferences));
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

    if (window.location.hash === '#/saved') renderSaved();
  }

  function getTodayDateString() {
    var today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /* ── Match Score Analysis ──────────────────────────────── */

  function calculateMatchScore(job) {
    if (!preferences.roleKeywords.length && !preferences.skills.length) return 0;

    var score = 0;

    var titleLower = job.title.toLowerCase();
    var hasTitleMatch = preferences.roleKeywords.some(function (kw) { return titleLower.includes(kw.toLowerCase()); });
    if (hasTitleMatch) score += 25;

    var descLower = job.description.toLowerCase();
    var hasDescMatch = preferences.roleKeywords.some(function (kw) { return descLower.includes(kw.toLowerCase()); });
    if (hasDescMatch) score += 15;

    var hasLocMatch = preferences.locations.some(function (loc) { return job.location.includes(loc); });
    if (hasLocMatch) score += 15;

    if (preferences.modes.includes(job.mode)) score += 10;

    if (job.experience === preferences.experience) score += 10;
    else if (preferences.experience === '0-2 Years' && (job.experience === 'Fresher' || job.experience.includes('0-') || job.experience.includes('1-'))) score += 5;

    var jobSkills = job.skills.map(function (s) { return s.toLowerCase(); });
    var hasSkillMatch = preferences.skills.some(function (s) { return jobSkills.includes(s.toLowerCase()); });
    if (hasSkillMatch) score += 15;

    if (job.postedDaysAgo <= 2) score += 5;
    if (job.source === 'LinkedIn') score += 5;

    return Math.min(score, 100);
  }

  function getScoreBadgeClass(score) {
    if (score >= 80) return 'badge--score-high';
    if (score >= 60) return 'badge--score-med';
    if (score >= 40) return 'badge--score-low';
    return 'badge--score-none';
  }

  /* ── Digest Logic ──────────────────────────────────────── */

  function loadDigest() {
    var date = getTodayDateString();
    var key = 'jobTrackerDigest_' + date;
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  function generateDigest() {
    if (!window.JOB_DATA) return [];

    var jobsWithScores = window.JOB_DATA.map(function (job) {
      job.score = calculateMatchScore(job);
      return job;
    });

    // Valid matches only
    var matches = jobsWithScores.filter(function (j) { return j.score > 0; });

    // Sort: Score DESC, then Freshness ASC
    matches.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.postedDaysAgo - b.postedDaysAgo;
    });

    var top10 = matches.slice(0, 10);

    // Save
    var date = getTodayDateString();
    localStorage.setItem('jobTrackerDigest_' + date, JSON.stringify(top10));

    return top10;
  }

  function getDigestText(digest) {
    var date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var text = "Daily Job Digest — " + date + "\n\n";
    digest.forEach(function (job, i) {
      text += (i + 1) + ". [" + job.score + "% Match] " + job.title + " at " + job.company + "\n";
      text += "   Location: " + job.location + " (" + job.mode + ")\n";
      text += "   Apply: " + job.applyUrl + "\n\n";
    });
    text += "Generated by Job Notification Tracker";
    return text;
  }

  /* ── Salary Parsing ────────────────────────────────────── */

  function parseSalary(salaryStr) {
    if (!salaryStr) return 0;
    var str = salaryStr.toLowerCase();
    var match = str.match(/(\d+\.?\d*)/);
    if (!match) return 0;
    var val = parseFloat(match[1]);
    if (str.includes('lpa')) val *= 100000;
    else if (str.includes('k')) val *= 1000;
    if (str.includes('month') || str.includes('mo')) val *= 12;
    return val;
  }

  /* ── Search & Filter Logic ─────────────────────────────── */

  function filterJobs() {
    if (!window.JOB_DATA) return [];

    var term = currentFilters.search.toLowerCase();
    var jobsWithScores = window.JOB_DATA.map(function (job) {
      job.score = calculateMatchScore(job);
      return job;
    });

    var filtered = jobsWithScores.filter(function (job) {
      var matchesSearch = true;
      if (term) {
        var text = (job.title + ' ' + job.company + ' ' + (job.skills || []).join(' ')).toLowerCase();
        matchesSearch = text.indexOf(term) !== -1;
      }

      var matchesLoc = currentFilters.location === 'Any' || job.location.includes(currentFilters.location);
      var matchesMode = currentFilters.mode === 'Any' || job.mode === currentFilters.mode;
      var matchesExp = currentFilters.experience === 'Any' ||
        (currentFilters.experience === 'Fresher' && job.experience === 'Fresher') ||
        (currentFilters.experience === '0-2 Years' && (job.experience === 'Fresher' || job.experience.startsWith('0') || job.experience.startsWith('1')));

      var matchesScore = !currentFilters.showMatchesOnly || job.score >= preferences.minMatchScore;

      return matchesSearch && matchesLoc && matchesMode && matchesExp && matchesScore;
    });

    filtered.sort(function (a, b) {
      if (currentFilters.sort === 'Latest') return a.postedDaysAgo - b.postedDaysAgo;
      else if (currentFilters.sort === 'Match Score') return b.score - a.score;
      else if (currentFilters.sort === 'Salary') return parseSalary(b.salaryRange) - parseSalary(a.salaryRange);
      return 0;
    });

    return filtered;
  }

  function handleSearchInput() {
    var searchInput = document.getElementById('search-input');
    var locSelect = document.getElementById('filter-loc');
    var modeSelect = document.getElementById('filter-mode');
    var expSelect = document.getElementById('filter-exp');
    var sortSelect = document.getElementById('filter-sort');
    var matchToggle = document.getElementById('match-toggle');

    if (searchInput) currentFilters.search = searchInput.value;
    if (locSelect) currentFilters.location = locSelect.value;
    if (modeSelect) currentFilters.mode = modeSelect.value;
    if (expSelect) currentFilters.experience = expSelect.value;
    if (sortSelect) currentFilters.sort = sortSelect.value;
    if (matchToggle) currentFilters.showMatchesOnly = matchToggle.checked;

    var jobContainer = document.getElementById('job-list-container');
    if (jobContainer) {
      var filtered = filterJobs();
      if (filtered.length === 0) {
        jobContainer.innerHTML = '<div class="state-empty" style="grid-column: 1/-1"><h3 class="state-empty__title">No jobs found.</h3><p class="state-empty__message">Try adjusting your filters or lowering your match threshold.</p></div>';
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

    var scoreClass = getScoreBadgeClass(job.score);
    var scoreBadge = job.score > 0 ? '<span class="badge ' + scoreClass + '">Match: ' + job.score + '%</span>' : '<span class="badge badge--neutral">No Match</span>';

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
      scoreBadge +
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

      '<select id="filter-sort" class="input filter-bar__select">' +
      '<option value="Latest" ' + (currentFilters.sort === 'Latest' ? 'selected' : '') + '>Sort: Latest</option>' +
      '<option value="Match Score" ' + (currentFilters.sort === 'Match Score' ? 'selected' : '') + '>Match Score</option>' +
      '<option value="Salary" ' + (currentFilters.sort === 'Salary' ? 'selected' : '') + '>Salary (High-Low)</option>' +
      '</select>' +
      '</div>' +

      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">' +
      '<h3 style="font-size:var(--text-lg); font-weight:700;">Job Feed</h3>' +
      '<label class="toggle-switch">' +
      '<input type="checkbox" id="match-toggle" class="toggle-switch__input" ' + (currentFilters.showMatchesOnly ? 'checked' : '') + '>' +
      '<span class="toggle-switch__label">Show only matches > ' + preferences.minMatchScore + '%</span>' +
      '</label>' +
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
      : '<div class="state-empty" style="grid-column: 1/-1"><h3 class="state-empty__title">No jobs found.</h3><p class="state-empty__message">Try adjusting your filters.</p></div>';

    var banner = '';
    if (preferences.roleKeywords.length === 0 && preferences.skills.length === 0) {
      banner = '<div style="background:#fef3c7; color:#92400e; padding:12px; margin-bottom:16px; border-radius:6px; font-weight:500; text-align:center;">' +
        '⚠️ Set your <a href="#/settings" style="text-decoration:underline;">preferences</a> to activate intelligent matching.' +
        '</div>';
    }

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header">' +
      '<h2 class="page-section__title">Dashboard</h2>' +
      '<p class="page-section__desc">Browse and track new opportunities.</p>' +
      '</div>' +
      banner +
      renderFilterBar() +
      '<div id="job-list-container" class="job-grid">' +
      jobsHtml +
      '</div>' +
      '</div>';

    document.title = 'Dashboard — Job Notification Tracker';
  }

  function renderDigest() {
    app.className = 'route-container route-container--top';

    // Check if preferences set
    if (preferences.roleKeywords.length === 0 && preferences.skills.length === 0) {
      app.innerHTML = '<div class="page-section"><div class="page-section__header"><h2 class="page-section__title">Daily Digest</h2></div><div class="state-empty"><h3 class="state-empty__title">Preferences Not Set</h3><p class="state-empty__message">Customize your settings to enable personalized Daily Digests.</p><a href="#/settings" class="btn btn--primary">Go to Settings</a></div></div>';
      return;
    }

    var digest = loadDigest();

    // UI If Digest Exists
    if (digest) {
      var dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      var listHtml = digest.map(function (job, i) {
        var scoreClass = getScoreBadgeClass(job.score);
        return (
          '<div class="digest-item">' +
          '<div class="digest-item__main">' +
          '<div class="digest-item__title">' + (i + 1) + '. ' + job.title + '</div>' +
          '<div class="digest-item__company">' + job.company + ' • ' + job.location + '</div>' +
          '</div>' +
          '<div class="digest-item__score">' +
          '<span class="badge ' + scoreClass + '">' + job.score + '% Match</span>' +
          '</div>' +
          '<a href="' + job.applyUrl + '" target="_blank" style="margin-left:16px; font-size:14px; font-weight:600; color:var(--color-primary);">Apply</a>' +
          '</div>'
        );
      }).join('');

      app.innerHTML =
        '<div class="page-section">' +
        '<div class="digest-container">' +
        '<div class="digest-header">' +
        '<div class="digest-date">' + dateStr + '</div>' +
        '<div class="digest-title">Daily Job Brief</div>' +
        '</div>' +
        '<div class="digest-body">' + listHtml + '</div>' +
        '<div class="digest-footer">Generated based on your preferences.</div>' +
        '</div>' +
        '<div class="digest-actions">' +
        '<button id="btn-copy-digest" class="btn btn--secondary">' + icons.copy + ' Copy Text</button>' +
        '<button id="btn-email-digest" class="btn btn--secondary">' + icons.mail + ' Email Draft</button>' +
        '</div>' +
        '</div>';

      return;
    }

    // UI If Ready to Generate
    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header"><h2 class="page-section__title">Daily Digest</h2><p class="page-section__desc">A curated summary delivered every morning.</p></div>' +
      '<div class="state-empty">' +
      icons.clock +
      '<h3 class="state-empty__title">Your 9AM Digest is ready.</h3>' +
      '<p class="state-empty__message">Generate your personalized report for today.</p>' +
      '<button id="btn-generate-digest" class="btn btn--primary" style="margin-top:16px;">Generate Digest (Simulated)</button>' +
      '</div>' +
      '<p style="text-align:center; margin-top:16px; font-size:12px; color:var(--color-text-secondary);">Demo Mode: Daily trigger simulated manually.</p>' +
      '</div>';
  }

  function renderSaved() {
    app.className = 'route-container route-container--top';
    var savedList = window.JOB_DATA.filter(function (job) { return savedJobs.has(job.id); });
    savedList.forEach(function (job) { job.score = calculateMatchScore(job); });

    var contentHtml = savedList.length > 0
      ? '<div class="job-grid">' + savedList.map(renderJobCard).join('') + '</div>'
      : '<div class="state-empty"><h3 class="state-empty__title">No saved jobs.</h3></div>';

    app.innerHTML = '<div class="page-section"><div class="page-section__header"><h2 class="page-section__title">Saved Jobs</h2></div>' + contentHtml + '</div>';
    document.title = 'Saved — Job Notification Tracker';
  }

  function renderSettings() {
    app.className = 'route-container route-container--top';
    var roleVal = preferences.roleKeywords.join(', ');
    var locVal = preferences.locations.join(', ');
    var skillVal = preferences.skills.join(', ');
    var isRemote = preferences.modes.includes('Remote') ? 'checked' : '';
    var isHybrid = preferences.modes.includes('Hybrid') ? 'checked' : '';
    var isOnsite = preferences.modes.includes('Onsite') ? 'checked' : '';

    app.innerHTML =
      '<div class="page-section">' +
      '<div class="page-section__header"><h2 class="page-section__title">Settings</h2><p class="page-section__desc">Configure your job tracking preferences.</p></div>' +
      '<div class="card settings-form">' +
      '<div class="field"><label class="label">Role Keywords</label><input id="pref-roles" class="input" placeholder="e.g. Frontend, React" value="' + roleVal + '"></div>' +
      '<div class="field"><label class="label">Locations</label><input id="pref-locs" class="input" placeholder="e.g. Bangalore, Remote" value="' + locVal + '"></div>' +
      '<div class="field"><label class="label">Work Mode</label><div style="display:flex; gap:16px;"><label><input type="checkbox" class="pref-mode" value="Remote" ' + isRemote + '> Remote</label><label><input type="checkbox" class="pref-mode" value="Hybrid" ' + isHybrid + '> Hybrid</label><label><input type="checkbox" class="pref-mode" value="Onsite" ' + isOnsite + '> Onsite</label></div></div>' +
      '<div class="field"><label class="label">Experience</label><select id="pref-exp" class="input"><option value="Any">Any</option><option value="Fresher" ' + (preferences.experience === 'Fresher' ? 'selected' : '') + '>Fresher</option><option value="0-2 Years" ' + (preferences.experience === '0-2 Years' ? 'selected' : '') + '>0-2 Years</option></select></div>' +
      '<div class="field"><label class="label">Skills</label><input id="pref-skills" class="input" placeholder="e.g. Java, Python" value="' + skillVal + '"></div>' +
      '<div class="field"><label class="label" style="display:flex; justify-content:space-between;"><span>Minimum Match Score</span><span id="score-val" class="range-value">' + preferences.minMatchScore + '%</span></label><input type="range" id="pref-score" class="range-slider" min="0" max="100" value="' + preferences.minMatchScore + '"></div>' +
      '<button id="save-prefs" class="btn btn--primary btn--block">Save Preferences</button>' +
      '</div>' +
      '</div>';
    document.title = 'Settings — Job Notification Tracker';
  }

  function handleSavePreferences() {
    var roles = document.getElementById('pref-roles').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var locs = document.getElementById('pref-locs').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var skills = document.getElementById('pref-skills').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var exp = document.getElementById('pref-exp').value;
    var score = document.getElementById('pref-score').value;

    var modes = [];
    document.querySelectorAll('.pref-mode:checked').forEach(function (cb) { modes.push(cb.value); });

    preferences = {
      roleKeywords: roles,
      locations: locs,
      modes: modes,
      experience: exp,
      skills: skills,
      minMatchScore: parseInt(score, 10)
    };

    savePreferences();
    alert('Preferences saved!');
    window.location.hash = '#/dashboard';
  }

  function renderProof() {
    app.className = 'route-container route-container--top';
    app.innerHTML = '<div class="page-section"><div class="page-section__header"><h2 class="page-section__title">Proof of Work</h2></div><div class="state-empty"><h3 class="state-empty__title">Artifacts</h3></div></div>';
  }

  /* ── Modal & Navigation ────────────────────────────────── */
  // ... (Same modal logic)
  function openModal(job) {
    modalRoot.innerHTML =
      '<div class="modal-overlay" id="modal-overlay">' +
      '<div class="modal">' +
      '<div class="modal__header"><h3 class="modal__title">' + job.title + '</h3><button class="modal__close" id="modal-close">' + icons.close + '</button></div>' +
      '<div class="modal__content">' +
      '<div class="modal__section"><div class="modal__section-title">Company Info</div><p><strong>' + job.company + '</strong> • ' + job.location + ' (' + job.mode + ')</p><p>Posted ' + job.postedDaysAgo + ' days ago via ' + job.source + '</p></div>' +
      '<div class="modal__section"><div class="modal__section-title">Job Description</div><p>' + job.description + '</p></div>' +
      '<div class="modal__section"><div class="modal__section-title">Skills Required</div><div class="job-card__tags">' + job.skills.map(function (s) { return '<span class="badge badge--neutral">' + s + '</span>'; }).join('') + '</div></div>' +
      '<div class="modal__section"><div class="modal__section-title">Details</div><p>Experience: ' + job.experience + '</p><p>Salary: ' + job.salaryRange + '</p></div>' +
      '</div>' +
      '<div class="modal__footer"><button class="btn btn--ghost" id="modal-close-btn">Close</button><a href="' + job.applyUrl + '" target="_blank" class="btn btn--primary">Apply Now ' + icons.external + '</a></div>' +
      '</div>' +
      '</div>';
    document.getElementById('modal-close').onclick = closeModal;
    document.getElementById('modal-close-btn').onclick = closeModal;
    document.getElementById('modal-overlay').onclick = function (e) { if (e.target === this) closeModal(); };
    document.body.style.overflow = 'hidden';
  }
  function closeModal() { modalRoot.innerHTML = ''; document.body.style.overflow = ''; }

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
      navLinks[i].classList.toggle('nav__link--active', navLinks[i].getAttribute('data-route') === hash);
    }
  }

  function navigate() {
    var hash = window.location.hash.replace('#', '') || '/';
    var route = routes[hash];
    if (!route) { window.location.hash = '#/dashboard'; return; }
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
    if (target.classList.contains('action-view')) {
      var id = target.getAttribute('data-id');
      var job = window.JOB_DATA.find(function (j) { return j.id === id; });
      if (job) openModal(job);
    }
    if (target.classList.contains('action-save')) {
      var id = target.getAttribute('data-id');
      toggleSaveJob(id, target);
    }
    if (target.id === 'save-prefs') handleSavePreferences();

    // Digest Actions
    if (target.id === 'btn-generate-digest') {
      var digest = generateDigest();
      if (digest.length === 0) alert('No matches found for today based on your preferences.');
      else renderDigest();
    }
    if (target.id === 'btn-copy-digest') {
      var text = getDigestText(loadDigest());
      navigator.clipboard.writeText(text).then(function () { alert('Digest copied to clipboard!'); });
    }
    if (target.id === 'btn-email-digest') {
      var text = getDigestText(loadDigest());
      window.open('mailto:?subject=Daily Job Digest&body=' + encodeURIComponent(text));
    }
  }

  function handleAppChange(e) {
    if (e.target.id === 'pref-score') document.getElementById('score-val').textContent = e.target.value + '%';
    if (e.target.classList.contains('filter-bar__select') || e.target.id === 'match-toggle') handleSearchInput();
  }

  function handleAppInput(e) { if (e.target.id === 'search-input') handleSearchInput(); }

  document.addEventListener('DOMContentLoaded', function () {
    app = document.getElementById('app');
    modalRoot = document.getElementById('modal-root');
    navLinks = document.querySelectorAll('.nav__link');
    hamburger = document.getElementById('nav-hamburger');
    navLinksContainer = document.getElementById('nav-links');

    loadData();

    if (hamburger && navLinksContainer) {
      hamburger.addEventListener('click', function () {
        var isOpen = navLinksContainer.classList.toggle('nav__links--open');
        hamburger.setAttribute('aria-expanded', isOpen);
      });
    }

    app.addEventListener('click', handleAppClick);
    app.addEventListener('change', handleAppChange);
    app.addEventListener('input', handleAppInput);

    window.addEventListener('hashchange', navigate);
    navigate();
  });

})();
