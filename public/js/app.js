/* ─── Theme (apply immediately to avoid flash) ──────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('glTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  // Also apply to #htmlRoot for compatibility with EJS inline script
  const root = document.getElementById('htmlRoot');
  if (root) root.setAttribute('data-theme', saved);
})();

/* ─── Toast Utility ─────────────────────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const iconMap = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${iconMap[type] || iconMap.success}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ─── Modal Utility ─────────────────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ─── All DOM-ready logic ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ─── Dark Mode Toggle ────────────────────────────────────────────────────── */
  const btn = document.getElementById('btnTheme');
  if (btn) {
    const moonSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    const sunSVG  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

    const updateIcon = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = isDark ? sunSVG : moonSVG;
      btn.title     = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    };
    updateIcon();

    btn.addEventListener('click', () => {
      const cur  = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      // Also sync the EJS-rendered htmlRoot element
      const htmlRoot = document.getElementById('htmlRoot');
      if (htmlRoot) htmlRoot.setAttribute('data-theme', next);
      localStorage.setItem('glTheme', next);
      updateIcon();
      showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled', 'info');
    });
  }

  /* ─── Sidebar Toggle (Mobile) ─────────────────────────────────────────────── */
  const sidebar  = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggle   = document.getElementById('menuToggle');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Close sidebar when a nav link is tapped on mobile
  document.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', closeSidebar));

  /* ─── Animate stat numbers ────────────────────────────────────────────────── */
  document.querySelectorAll('.stat-num').forEach(el => {
    const raw    = el.textContent.trim();
    const target = parseInt(raw.replace(/[^0-9]/g, ''));
    if (isNaN(target) || target === 0) return;
    const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
    const suffix = raw.match(/[^0-9]*$/)?.[0] || '';
    let current  = 0;
    const step   = Math.max(1, Math.ceil(target / 30));
    el.textContent = prefix + '0' + suffix;
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 28);
  });

  /* ─── Bar chart animation ─────────────────────────────────────────────────── */
  document.querySelectorAll('.bar').forEach(bar => {
    const h = bar.style.height;
    bar.style.height = '0px';
    bar.style.transition = 'height 0.7s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { bar.style.height = h; }, 150);
  });

  /* ─── Dept bar fill animation ─────────────────────────────────────────────── */
  document.querySelectorAll('.dept-bar-fill').forEach(el => {
    const w = el.style.width;
    el.style.width = '0';
    setTimeout(() => { el.style.width = w; }, 250);
  });
});
