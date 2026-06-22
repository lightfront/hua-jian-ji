/* ===== 花间集 — Main Application ===== */

(function () {
  'use strict';

  // ---- State ----
  let poems = [];
  let filtered = [];
  let searchTerm = '';
  let authorFilter = '';
  let rhythmicFilter = '';

  // ---- DOM refs ----
  const grid = document.getElementById('poemGrid');
  const empty = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const authorSel = document.getElementById('authorFilter');
  const rhythmicSel = document.getElementById('rhythmicFilter');
  const countSpan = document.getElementById('poemCount');
  const commentaryCountSpan = document.getElementById('commentaryCount');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // ---- Tag display names ----
  const TAG_LABELS = {
    spring: '春', autumn: '秋', flower: '花', moon: '月',
    willow: '柳', rain: '雨', snow: '雪', lotus: '莲',
    plum: '梅', dream: '梦', sorrow: '愁', regret: '恨',
    tears: '泪', longing: '相思', parting: '离别', memory: '忆',
    return: '归', boudoir: '闺', adornment: '妆',
  };

  // ---- Fetch & init ----
  async function init() {
    try {
      const resp = await fetch('poems.json', { cache: 'no-store' });
      const data = await resp.json();
      poems = data.poems || data; // handle both wrapped & raw array
      if (data.meta) {
        document.title = data.meta.title;
        countSpan.textContent = data.meta.total || poems.length;
      } else {
        countSpan.textContent = poems.length;
      }
      populateFilters();
      applyFilters();
      // 统计含讲解的词数
      commentaryCountSpan.textContent = poems.filter(p => (p.notes && p.notes.length) || p.background).length;
      bindEvents();
    } catch (err) {
      console.error('Failed to load poems:', err);
      grid.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--ink-light);">加载失败，请刷新重试</p>';
    }
  }

  // ---- Populate filter dropdowns ----
  function populateFilters() {
    const authors = [...new Set(poems.map(p => p.author))].sort();
    const rhythmics = [...new Set(poems.map(p => p.rhythmic).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh'));

    authors.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      authorSel.appendChild(opt);
    });

    rhythmics.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      rhythmicSel.appendChild(opt);
    });
  }

  // ---- Filter & render ----
  function applyFilters() {
    searchTerm = searchInput.value.trim().toLowerCase();
    authorFilter = authorSel.value;
    rhythmicFilter = rhythmicSel.value;

    filtered = poems.filter(p => {
      // Author filter
      if (authorFilter && p.author !== authorFilter) return false;
      // Rhythmic filter
      if (rhythmicFilter && p.rhythmic !== rhythmicFilter) return false;
      // Search
      if (searchTerm) {
        const haystack = (p.title + ' ' + p.author + ' ' + p.rhythmic + ' ' + p.content.join('')).toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }
      return true;
    });

    render();
  }

  // ---- Render cards ----
  function render() {
    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.classList.add('visible');
      return;
    }
    empty.classList.remove('visible');

    const html = filtered.map(p => {
      const excerpt = p.content.slice(0, 2).join('　');
      const tags = (p.tags || [])
        .filter(t => TAG_LABELS[t])
        .map(t => `<span class="tag">${TAG_LABELS[t]}</span>`)
        .join('');
      const hasCommentary = !!(p.notes && p.notes.length) || !!p.background;
      return `
        <div class="poem-card${hasCommentary ? ' has-commentary' : ''}" data-id="${p.id}">
          <div class="poem-card-header">
            <span class="poem-card-title">${escapeHtml(p.title)}</span>
            <span class="poem-card-author">${escapeHtml(p.author)}</span>
          </div>
          <div class="poem-card-excerpt">${escapeHtml(excerpt)}</div>
          ${tags ? `<div class="poem-card-tags">${tags}</div>` : ''}
          ${hasCommentary ? '<span class="commentary-badge" title="含字词注释与创作背景">讲解</span>' : ''}
        </div>
      `;
    }).join('');

    grid.innerHTML = html;
  }

  // ---- Show modal ----
  function showModal(id) {
    const poem = poems.find(p => p.id === id);
    if (!poem) return;

    const tags = (poem.tags || [])
      .filter(t => TAG_LABELS[t])
      .map(t => `<span class="tag">${TAG_LABELS[t]}</span>`)
      .join('');

    // 字词注释：逐条 term + gloss
    const notesHtml = (poem.notes && poem.notes.length)
      ? `<section class="commentary">
          <h3 class="commentary-title">字词注释</h3>
          <dl class="notes-list">
            ${poem.notes.map(n => `
              <div class="note-item">
                <dt>${escapeHtml(n.term)}</dt>
                <dd>${escapeHtml(n.gloss)}</dd>
              </div>
            `).join('')}
          </dl>
        </section>`
      : '';

    // 创作背景
    const bgHtml = poem.background
      ? `<section class="commentary">
          <h3 class="commentary-title">创作背景</h3>
          <p class="commentary-text">${escapeHtml(poem.background)}</p>
        </section>`
      : '';

    modalBody.innerHTML = `
      <div class="modal-body-title">${escapeHtml(poem.title)}</div>
      ${poem.rhythmic ? `<div class="modal-body-rhythmic">【${escapeHtml(poem.rhythmic)}】</div>` : ''}
      <div class="modal-body-author">${escapeHtml(poem.author)}</div>
      <div class="modal-body-content">
        ${poem.content.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
      </div>
      ${tags ? `<div class="modal-body-tags">${tags}</div>` : ''}
      ${notesHtml}
      ${bgHtml}
    `;
    modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    // 重置滚动到顶部，避免上一次的滚动位置残留
    modalOverlay.scrollTop = 0;
  }

  function hideModal() {
    modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // ---- Debounce ----
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ---- Escape HTML ----
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Bind events ----
  function bindEvents() {
    // Search with debounce
    const debouncedFilter = debounce(applyFilters, 250);
    searchInput.addEventListener('input', debouncedFilter);

    // Dropdown filters
    authorSel.addEventListener('change', applyFilters);
    rhythmicSel.addEventListener('change', applyFilters);

    // Card clicks via delegation
    grid.addEventListener('click', e => {
      const card = e.target.closest('.poem-card');
      if (card) {
        const id = parseInt(card.dataset.id, 10);
        showModal(id);
      }
    });

    // Modal close
    modalClose.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) hideModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideModal();
    });
  }

  // ---- Start ----
  document.addEventListener('DOMContentLoaded', init);
})();
