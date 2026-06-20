/* ─── Theme ──────────────────────────────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('glTheme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
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
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
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

/* ─── Dark Mode Toggle ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnTheme');
  if (btn) {
    const update = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.textContent = isDark ? '☀️' : '🌙';
      btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    };
    update();
    btn.addEventListener('click', () => {
      const cur  = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('glTheme', next);
      update();
      showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled', 'info');
    });
  }

  /* ─── Animate stat numbers ─────────────────────────────────────────────── */
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

  /* ─── Bar chart animation ──────────────────────────────────────────────── */
  document.querySelectorAll('.bar').forEach(bar => {
    const h = bar.style.height;
    bar.style.height = '0px';
    bar.style.transition = 'height 0.7s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { bar.style.height = h; }, 150);
  });

  /* ─── Dept bar fill animation ──────────────────────────────────────────── */
  document.querySelectorAll('.dept-bar-fill').forEach(el => {
    const w = el.style.width;
    el.style.width = '0';
    setTimeout(() => { el.style.width = w; }, 250);
  });
});
