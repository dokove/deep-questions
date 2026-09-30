/**
 * THE MASTERY SUITE — INTERVIEW QUESTIONS VIEWER
 * Interactive Single Page App for exploring 1,100 technical interview questions.
 */

(function () {
  'use strict';

  // Load Database from global or fallback
  const db = window.INTERVIEW_DATA;
  if (!db || !db.modules) {
    console.error('No se encontró la base de datos de preguntas.');
    return;
  }

  // Application State
  const state = {
    activeModuleId: 'nodejs-core',
    searchQuery: '',
    seniorityFilter: 'ALL',
    statusFilter: 'ALL',
    expandedSections: new Set(),
    openQuestions: new Set(),
    mastered: new Set(JSON.parse(localStorage.getItem('mastery_mastered') || '[]')),
    bookmarks: new Set(JSON.parse(localStorage.getItem('mastery_bookmarks') || '[]')),
  };

  // Helper: Persist state to localStorage
  function saveStorage() {
    localStorage.setItem('mastery_mastered', JSON.stringify([...state.mastered]));
    localStorage.setItem('mastery_bookmarks', JSON.stringify([...state.bookmarks]));
    updateGlobalProgress();
  }

  // Helper: Simple and Safe Markdown Parser for answers
  function parseMarkdown(md) {
    if (!md) return '';

    let html = '';
    const lines = md.split('\n');
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer = [];
    let inList = false;
    let listType = ''; // 'ul' or 'ol'
    let inTable = false;
    let tableBuffer = [];

    function flushTable() {
      if (!inTable) return;
      if (tableBuffer.length === 0) { inTable = false; return; }
      
      let tableHtml = '<table><thead><tr>';
      const headerCols = tableBuffer[0].split('|').map(c => c.trim()).filter(c => c.length > 0);
      headerCols.forEach(col => { tableHtml += `<th>${col}</th>`; });
      tableHtml += '</tr></thead><tbody>';

      for (let i = 2; i < tableBuffer.length; i++) {
        const rowCols = tableBuffer[i].split('|').map(c => c.trim()).filter(c => c.length > 0);
        if (rowCols.length > 0) {
          tableHtml += '<tr>';
          rowCols.forEach(col => { tableHtml += `<td>${col}</td>`; });
          tableHtml += '</tr>';
        }
      }
      tableHtml += '</tbody></table>';
      html += tableHtml;
      tableBuffer = [];
      inTable = false;
    }

    function flushList() {
      if (inList) {
        html += `</${listType}>`;
        inList = false;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block Start / End
      if (line.trim().startsWith('```')) {
        flushList();
        flushTable();
        if (inCodeBlock) {
          // Close Code Block
          const rawCode = codeBuffer.join('\n');
          const escapedCode = escapeHtml(rawCode);
          html += `
            <div class="code-container">
              <div class="code-header">
                <span>${codeLanguage || 'code'}</span>
                <button class="btn-copy" onclick="copySnippet(this)">Copiar</button>
              </div>
              <pre><code>${escapedCode}</code></pre>
            </div>
          `;
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          // Open Code Block
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '') || 'typescript';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Markdown Table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        inTable = true;
        tableBuffer.push(line.trim());
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Ordered List: "1. item"
      const olMatch = line.match(/^(\s*)([0-9]+)\.\s+(.+)$/);
      if (olMatch) {
        if (!inList || listType !== 'ol') {
          flushList();
          html += '<ol>';
          inList = true;
          listType = 'ol';
        }
        html += `<li>${formatInline(olMatch[3])}</li>`;
        continue;
      }

      // Unordered List: "- item" or "* item"
      const ulMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          flushList();
          html += '<ul>';
          inList = true;
          listType = 'ul';
        }
        html += `<li>${formatInline(ulMatch[2])}</li>`;
        continue;
      }

      flushList();

      // Empty line
      if (!line.trim()) {
        continue;
      }

      // Regular Paragraph
      html += `<p>${formatInline(line.trim())}</p>`;
    }

    flushList();
    flushTable();

    return html;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatInline(text) {
    let formatted = escapeHtml(text);
    // Bold: **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code: `code`
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    return formatted;
  }

  // Get current active module
  function getCurrentModule() {
    return db.modules.find(m => m.id === state.activeModuleId) || db.modules[0];
  }

  // Seniority badge class helper
  function getSeniorityBadgeClass(seniority) {
    const s = (seniority || '').toLowerCase();
    if (s.includes('staff') || s.includes('principal') || s.includes('architect')) return 'badge-staff';
    if (s.includes('senior') || s.includes('lead')) return 'badge-senior';
    if (s.includes('mid')) return 'badge-mid';
    return 'badge-junior';
  }

  // Match Question against active filters
  function questionMatchesFilters(q) {
    // Seniority Filter
    if (state.seniorityFilter !== 'ALL') {
      const qSen = (q.seniority || '').toUpperCase();
      if (!qSen.includes(state.seniorityFilter)) {
        return false;
      }
    }

    // Status Filter
    if (state.statusFilter === 'MASTERED' && !state.mastered.has(q.id)) return false;
    if (state.statusFilter === 'BOOKMARKED' && !state.bookmarks.has(q.id)) return false;
    if (state.statusFilter === 'PENDING' && state.mastered.has(q.id)) return false;

    // Search Query
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(query);
      const matchNum = q.number.toString() === query;
      const matchAnswer = (q.answer || '').toLowerCase().includes(query);
      const matchRed = (q.redFlag || '').toLowerCase().includes(query);
      const matchGreen = (q.greenFlag || '').toLowerCase().includes(query);
      return matchTitle || matchNum || matchAnswer || matchRed || matchGreen;
    }

    return true;
  }

  // Render Module Selector Pills
  function renderModulePills() {
    const container = document.getElementById('modulesBar');
    if (!container) return;

    container.innerHTML = db.modules.map(mod => {
      const isActive = mod.id === state.activeModuleId;
      // Calculate mastered in module
      let modMastered = 0;
      mod.sections.forEach(s => {
        s.questions.forEach(q => {
          if (state.mastered.has(q.id)) modMastered++;
        });
      });

      return `
        <button 
          class="module-pill ${isActive ? 'active' : ''}" 
          data-module-id="${mod.id}"
          style="--module-accent: ${mod.badgeColor};"
        >
          <span>${mod.icon}</span>
          <span>${mod.title}</span>
          <span class="pill-badge">${modMastered}/${mod.totalQuestions}</span>
        </button>
      `;
    }).join('');

    // Attach Click Events
    container.querySelectorAll('.module-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-module-id');
        if (id !== state.activeModuleId) {
          state.activeModuleId = id;
          state.openQuestions.clear();
          // By default expand first section
          state.expandedSections.clear();
          const curr = getCurrentModule();
          if (curr.sections[0]) state.expandedSections.add(curr.sections[0].id);
          renderApp();
        }
      });
    });
  }

  // Render Hero Section
  function renderHero() {
    const heroEl = document.getElementById('heroCard');
    if (!heroEl) return;

    const mod = getCurrentModule();
    heroEl.style.setProperty('--module-accent', mod.badgeColor);

    // Calculate module stats
    let totalQs = mod.totalQuestions;
    let masteredCount = 0;
    let bookmarkedCount = 0;

    mod.sections.forEach(s => {
      s.questions.forEach(q => {
        if (state.mastered.has(q.id)) masteredCount++;
        if (state.bookmarks.has(q.id)) bookmarkedCount++;
      });
    });

    const percent = totalQs > 0 ? Math.round((masteredCount / totalQs) * 100) : 0;

    heroEl.innerHTML = `
      <div class="hero-left">
        <div class="hero-tags">
          <span class="category-tag">${mod.category}</span>
          <span>•</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${mod.sections.length} Secciones</span>
          <span>•</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">📁 ${mod.filePath}</span>
        </div>
        <h1 class="hero-title">
          <span>${mod.icon}</span>
          <span>${mod.title}</span>
        </h1>
        <p class="hero-desc">${mod.description}</p>
      </div>
      <div class="hero-stats">
        <div class="hero-stat-item">
          <div class="num" style="color: ${mod.badgeColor};">${totalQs}</div>
          <div class="label">Preguntas</div>
        </div>
        <div class="hero-stat-item">
          <div class="num" style="color: var(--accent-emerald);">${masteredCount}</div>
          <div class="label">Dominadas (${percent}%)</div>
        </div>
        <div class="hero-stat-item">
          <div class="num" style="color: var(--accent-amber);">${bookmarkedCount}</div>
          <div class="label">Favoritas</div>
        </div>
      </div>
    `;
  }

  // Render Sections and Questions
  function renderSections() {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    const mod = getCurrentModule();
    container.style.setProperty('--module-accent', mod.badgeColor);

    let totalVisible = 0;

    const sectionsHtml = mod.sections.map(section => {
      // Filter questions in this section
      const visibleQuestions = section.questions.filter(questionMatchesFilters);
      totalVisible += visibleQuestions.length;

      if (visibleQuestions.length === 0 && (state.searchQuery || state.statusFilter !== 'ALL' || state.seniorityFilter !== 'ALL')) {
        return ''; // Hide empty section if filters are active
      }

      // Auto expand if search active and matches found
      const isExpanded = state.searchQuery.trim().length > 0 || state.expandedSections.has(section.id);

      const questionsHtml = visibleQuestions.map(q => {
        const isOpen = state.openQuestions.has(q.id);
        const isMastered = state.mastered.has(q.id);
        const isBookmarked = state.bookmarks.has(q.id);
        const seniorityClass = getSeniorityBadgeClass(q.seniority);
        const parsedAnswer = parseMarkdown(q.answer);

        return `
          <div class="question-card ${isOpen ? 'open' : ''}" id="qcard-${q.id}">
            <div class="question-summary" onclick="toggleQuestion('${q.id}')">
              <div class="question-info">
                <span class="question-number">#${q.number}</span>
                <span class="question-title-text">${q.title}</span>
              </div>
              <div class="question-actions-right" onclick="event.stopPropagation()">
                <span class="badge-seniority ${seniorityClass}">${q.seniority}</span>
                <button 
                  class="btn-icon ${isBookmarked ? 'bookmarked' : ''}" 
                  title="${isBookmarked ? 'Quitar de favoritas' : 'Marcar como favorita'}"
                  onclick="toggleBookmark('${q.id}')"
                >
                  ${isBookmarked ? '★' : '☆'}
                </button>
                <button 
                  class="btn-icon ${isMastered ? 'mastered' : ''}" 
                  title="${isMastered ? 'Marcada como dominada' : 'Marcar como dominada'}"
                  onclick="toggleMastered('${q.id}')"
                >
                  ${isMastered ? '✓' : '○'}
                </button>
              </div>
            </div>
            
            <div class="question-details">
              <div class="answer-body">
                ${parsedAnswer}
              </div>

              ${(q.redFlag || q.greenFlag) ? `
                <div class="criteria-container">
                  ${q.redFlag ? `
                    <div class="flag-box red-flag">
                      <div class="flag-title">🚩 Red Flag (Alerta de Rechazo)</div>
                      <div>${escapeHtml(q.redFlag)}</div>
                    </div>
                  ` : ''}
                  ${q.greenFlag ? `
                    <div class="flag-box green-flag">
                      <div class="flag-title">🟢 Green Flag (Criterio Sobresaliente)</div>
                      <div>${escapeHtml(q.greenFlag)}</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <div class="question-footer-bar">
                <button 
                  class="btn-master ${isMastered ? 'active' : ''}" 
                  onclick="toggleMastered('${q.id}')"
                >
                  ${isMastered ? '✓ Dominada' : '○ Marcar como Dominada'}
                </button>
                <button class="btn-copy" onclick="copyQuestionText('${q.id}')">
                  📋 Copiar Pregunta y Criterios
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="section-block ${isExpanded ? 'expanded' : ''}" id="sec-${section.id}">
          <div class="section-header" onclick="toggleSection('${section.id}')">
            <div class="section-title-wrapper">
              <span class="section-chevron">▶</span>
              <h2 class="section-title">${section.title}</h2>
            </div>
            <div class="section-meta">
              <span class="section-count-badge">${visibleQuestions.length} preguntas</span>
            </div>
          </div>
          <div class="questions-group">
            ${questionsHtml}
          </div>
        </div>
      `;
    }).join('');

    if (totalVisible === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No se encontraron preguntas</h3>
          <p>No hay preguntas que coincidan con la búsqueda "${state.searchQuery}" o los filtros seleccionados.</p>
          <button class="filter-btn" style="margin-top: 1rem;" onclick="resetFilters()">Limpiar Filtros</button>
        </div>
      `;
    } else {
      container.innerHTML = sectionsHtml;
    }
  }

  // Update Global Header Stats
  function updateGlobalProgress() {
    let totalQs = db.totalQuestions;
    let totalMastered = state.mastered.size;
    const percent = totalQs > 0 ? Math.round((totalMastered / totalQs) * 100) : 0;

    const fillEl = document.getElementById('globalProgressFill');
    const textEl = document.getElementById('globalProgressText');

    if (fillEl) fillEl.style.width = `${percent}%`;
    if (textEl) textEl.textContent = `${totalMastered} / ${totalQs} Dominadas (${percent}%)`;
  }

  // Full App Render
  function renderApp() {
    renderModulePills();
    renderHero();
    renderSections();
    updateGlobalProgress();
  }

  // Global Handlers attached to window
  window.toggleSection = function (sectionId) {
    if (state.expandedSections.has(sectionId)) {
      state.expandedSections.delete(sectionId);
    } else {
      state.expandedSections.add(sectionId);
    }
    const el = document.getElementById(`sec-${sectionId}`);
    if (el) el.classList.toggle('expanded');
  };

  window.toggleQuestion = function (questionId) {
    if (state.openQuestions.has(questionId)) {
      state.openQuestions.delete(questionId);
    } else {
      state.openQuestions.add(questionId);
    }
    const card = document.getElementById(`qcard-${questionId}`);
    if (card) card.classList.toggle('open');
  };

  window.toggleMastered = function (questionId) {
    if (state.mastered.has(questionId)) {
      state.mastered.delete(questionId);
    } else {
      state.mastered.add(questionId);
    }
    saveStorage();
    renderApp();
  };

  window.toggleBookmark = function (questionId) {
    if (state.bookmarks.has(questionId)) {
      state.bookmarks.delete(questionId);
    } else {
      state.bookmarks.add(questionId);
    }
    saveStorage();
    renderApp();
  };

  window.copySnippet = function (btn) {
    const pre = btn.closest('.code-container').querySelector('code');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      const orig = btn.innerText;
      btn.innerText = '¡Copiado!';
      setTimeout(() => { btn.innerText = orig; }, 1800);
    });
  };

  window.copyQuestionText = function (questionId) {
    const mod = getCurrentModule();
    let found = null;
    mod.sections.forEach(s => {
      s.questions.forEach(q => {
        if (q.id === questionId) found = q;
      });
    });

    if (!found) return;

    const clipText = `### ${found.number}. ${found.title}\n- Nivel: ${found.seniority}\n\nRespuesta:\n${found.answer}\n\n🚩 Red Flag: ${found.redFlag}\n🟢 Green Flag: ${found.greenFlag}`;
    navigator.clipboard.writeText(clipText).then(() => {
      alert('Pregunta y criterios copiados al portapapeles.');
    });
  };

  window.toggleAllSections = function () {
    const mod = getCurrentModule();
    const allExpanded = mod.sections.every(s => state.expandedSections.has(s.id));
    if (allExpanded) {
      state.expandedSections.clear();
    } else {
      mod.sections.forEach(s => state.expandedSections.add(s.id));
    }
    renderSections();
  };

  window.resetFilters = function () {
    state.searchQuery = '';
    state.seniorityFilter = 'ALL';
    state.statusFilter = 'ALL';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === 'ALL') btn.classList.add('active');
      else btn.classList.remove('active');
    });
    renderApp();
  };

  // Setup Event Listeners
  function initEvents() {
    // Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderSections();
      });
    }

    // Seniority Filter Buttons
    document.querySelectorAll('[data-seniority]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-seniority]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.seniorityFilter = btn.getAttribute('data-seniority');
        renderSections();
      });
    });

    // Status Filter Buttons
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.statusFilter = btn.getAttribute('data-status');
        renderSections();
      });
    });
  }

  // Initial Boot
  document.addEventListener('DOMContentLoaded', () => {
    // Expand first section by default
    const mod = getCurrentModule();
    if (mod && mod.sections[0]) {
      state.expandedSections.add(mod.sections[0].id);
    }
    initEvents();
    renderApp();
  });

})();
