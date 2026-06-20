// Small client-side interactivity
document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav on load (already done server-side, this is fallback)
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Animate stat numbers
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.textContent.replace(/[^0-9]/g,''));
    if (isNaN(target) || target === 0) return;
    let current = 0;
    const step  = Math.ceil(target / 25);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      // preserve non-numeric prefix/suffix
      el.textContent = el.textContent.replace(/\d+/, current);
      if (current >= target) clearInterval(timer);
    }, 30);
  });

  // Bar chart animation
  document.querySelectorAll('.bar').forEach(bar => {
    const h = bar.style.height;
    bar.style.height = '0';
    setTimeout(() => { bar.style.height = h; bar.style.transition = 'height 0.6s ease'; }, 100);
  });

  // Department bar fill animation
  document.querySelectorAll('.dept-bar-fill').forEach(el => {
    const w = el.style.width;
    el.style.width = '0';
    setTimeout(() => { el.style.width = w; }, 200);
  });
});
