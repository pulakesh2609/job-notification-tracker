/* ============================================================
   KodNest Premium Build System — Main JavaScript
   ============================================================
   Minimal interactivity for the design system showcase.
   No frameworks. No dependencies.
   ============================================================ */

(function () {
  'use strict';

  /* ── Proof Footer Checkboxes ────────────────────────────── */

  function initProofChecklist() {
    const items = document.querySelectorAll('.proof-footer__item');

    items.forEach(function (item) {
      const checkbox = item.querySelector('.checkbox__input');
      if (!checkbox) return;

      checkbox.addEventListener('change', function () {
        if (this.checked) {
          item.classList.add('proof-footer__item--checked');
        } else {
          item.classList.remove('proof-footer__item--checked');
        }
        updateProofProgress();
      });
    });
  }

  function updateProofProgress() {
    const total = document.querySelectorAll('.proof-footer .checkbox__input').length;
    const checked = document.querySelectorAll('.proof-footer .checkbox__input:checked').length;
    const counter = document.getElementById('proof-counter');
    if (counter) {
      counter.textContent = checked + ' / ' + total + ' verified';
    }
  }

  /* ── Copy to Clipboard ─────────────────────────────────── */

  function initCopyButtons() {
    const copyButtons = document.querySelectorAll('[data-copy-target]');

    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = this.getAttribute('data-copy-target');
        var target = document.getElementById(targetId);
        if (!target) return;

        var text = target.textContent || target.innerText;

        navigator.clipboard.writeText(text).then(function () {
          var originalText = btn.textContent;
          btn.textContent = 'Copied';
          btn.classList.add('btn--success-flash');
          setTimeout(function () {
            btn.textContent = originalText;
            btn.classList.remove('btn--success-flash');
          }, 1500);
        }).catch(function () {
          /* Fallback for older browsers */
          var textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);

          var originalText = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(function () {
            btn.textContent = originalText;
          }, 1500);
        });
      });
    });
  }

  /* ── Status Badge Cycling (Demo) ────────────────────────── */

  function initStatusDemo() {
    var badge = document.getElementById('status-badge');
    if (!badge) return;

    var states = [
      { text: 'Not Started', className: 'badge--neutral' },
      { text: 'In Progress', className: 'badge--active'  },
      { text: 'Shipped',     className: 'badge--success' }
    ];

    var current = 0;

    badge.addEventListener('click', function () {
      current = (current + 1) % states.length;
      badge.textContent = states[current].text;
      badge.className = 'badge ' + states[current].className;
    });
  }

  /* ── Initialize ─────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initProofChecklist();
    initCopyButtons();
    initStatusDemo();
  });

})();
