/* Prop Firm FAQ — shared interactive behaviour.
   Linked from all /prop-firm-faq/*.html pages. */

(function () {
  'use strict';

  /* ---------- Search (dropdown picker) ---------- */
  const search = document.getElementById('faq-search');
  const info = document.getElementById('search-info');
  const main = document.querySelector('.faq-main') || document.querySelector('main');
  const inputWrap = search ? search.closest('.search-input-wrap') : null;

  if (search && main && inputWrap) {
    const allDetails = Array.from(main.querySelectorAll('details.gfaq-item'));
    const total = allDetails.length;
    const MAX_RESULTS = 12;

    // Pre-index questions + section titles so input handling stays fast.
    const items = allDetails.map((d) => {
      const qEl = d.querySelector('.gfaq-question');
      const aEl = d.querySelector('.gfaq-answer');
      const section = d.closest('section.cat-section');
      const sectionTitle = section ? section.querySelector('.cat-title') : null;
      const question = qEl ? qEl.textContent.trim() : '';
      const answer = aEl ? aEl.textContent.trim() : '';
      return {
        el: d,
        question,
        section: sectionTitle ? sectionTitle.textContent.trim() : '',
        haystack: (question + ' ' + answer).toLowerCase(),
      };
    });

    // Build dropdown element once.
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'Search results');
    inputWrap.appendChild(dropdown);

    let activeIndex = -1;
    let currentResults = [];

    function setShortcutVisible(visible) {
      const sc = inputWrap.querySelector('.search-shortcut');
      if (sc) sc.style.display = visible ? '' : 'none';
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    }

    function highlight(text, term) {
      const safe = escapeHtml(text);
      if (!term) return safe;
      const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return safe.replace(re, '<mark>$1</mark>');
    }

    function closeDropdown() {
      dropdown.classList.remove('open');
      dropdown.innerHTML = '';
      activeIndex = -1;
      currentResults = [];
      search.setAttribute('aria-expanded', 'false');
    }

    function openFaq(target) {
      target.open = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('flash');
      setTimeout(() => target.classList.remove('flash'), 1600);
      const focusable = target.querySelector('summary');
      if (focusable) focusable.focus({ preventScroll: true });
    }

    function selectResult(idx) {
      const match = currentResults[idx];
      if (!match) return;
      openFaq(match.el);
      search.value = '';
      if (info) info.textContent = '';
      setShortcutVisible(true);
      closeDropdown();
    }

    function setActive(idx) {
      const options = dropdown.querySelectorAll('.search-result');
      options.forEach((o, i) => o.classList.toggle('is-active', i === idx));
      activeIndex = idx;
      const active = options[idx];
      if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function render(term) {
      const matches = currentResults.slice(0, MAX_RESULTS);
      if (!matches.length) {
        dropdown.innerHTML = `<div class="search-empty">No questions match "<strong>${escapeHtml(term)}</strong>" — try a different keyword.</div>`;
        dropdown.classList.add('open');
        search.setAttribute('aria-expanded', 'true');
        return;
      }
      dropdown.innerHTML = matches.map((m, i) => `
        <button type="button" class="search-result" role="option" data-idx="${i}">
          <span class="search-result-q">${highlight(m.question, term)}</span>
          ${m.section ? `<span class="search-result-section">${escapeHtml(m.section)}</span>` : ''}
        </button>
      `).join('');
      if (currentResults.length > MAX_RESULTS) {
        dropdown.insertAdjacentHTML('beforeend',
          `<div class="search-more">+ ${currentResults.length - MAX_RESULTS} more — refine your search</div>`);
      }
      dropdown.classList.add('open');
      search.setAttribute('aria-expanded', 'true');
    }

    function update(rawTerm) {
      const term = rawTerm.trim().toLowerCase();
      if (!term) {
        currentResults = [];
        if (info) info.textContent = '';
        setShortcutVisible(true);
        closeDropdown();
        return;
      }
      setShortcutVisible(false);
      currentResults = items.filter((it) => it.haystack.includes(term));
      if (info) {
        info.innerHTML = currentResults.length === 0
          ? `No questions match "<strong>${escapeHtml(term)}</strong>"`
          : `Showing <strong>${Math.min(currentResults.length, MAX_RESULTS)}</strong> of ${currentResults.length} matching "<strong>${escapeHtml(term)}</strong>" (of ${total} total)`;
      }
      render(term);
      activeIndex = currentResults.length ? 0 : -1;
      if (activeIndex === 0) setActive(0);
    }

    search.addEventListener('input', (e) => update(e.target.value));
    search.addEventListener('focus', () => { if (search.value.trim()) update(search.value); });

    search.addEventListener('keydown', (e) => {
      const options = dropdown.querySelectorAll('.search-result');
      if (e.key === 'Escape') {
        if (dropdown.classList.contains('open')) {
          closeDropdown();
        } else {
          search.value = '';
          update('');
          search.blur();
        }
      } else if (e.key === 'ArrowDown' && options.length) {
        e.preventDefault();
        setActive((activeIndex + 1) % options.length);
      } else if (e.key === 'ArrowUp' && options.length) {
        e.preventDefault();
        setActive((activeIndex - 1 + options.length) % options.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        selectResult(activeIndex);
      }
    });

    dropdown.addEventListener('mousedown', (e) => {
      // mousedown so click fires before input loses focus / dropdown closes
      const btn = e.target.closest('.search-result');
      if (!btn) return;
      e.preventDefault();
      selectResult(parseInt(btn.dataset.idx, 10));
    });

    dropdown.addEventListener('mousemove', (e) => {
      const btn = e.target.closest('.search-result');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      if (idx !== activeIndex) setActive(idx);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrap')) closeDropdown();
    });

    // Global "/" shortcut to focus the search input.
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== search) {
        const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          search.focus();
        }
      }
    });
  }

  /* ---------- Back-to-Top ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const toggle = () => backToTop.classList.toggle('visible', window.scrollY > 600);
    window.addEventListener('scroll', toggle, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    toggle();
  }

  /* ---------- TOC anchor flash ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target && target.classList.contains('cat-section')) {
      setTimeout(() => {
        target.classList.add('flash-section');
        setTimeout(() => target.classList.remove('flash-section'), 1200);
      }, 400);
    }
  });
})();
