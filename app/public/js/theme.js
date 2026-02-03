(function(){
  const key = 'chesshub_theme';
  const toggle = document.getElementById('theme-toggle');
  const apply = (mode) => {
    if(mode === 'dark') document.documentElement.classList.add('dark'), document.body.classList.add('dark');
    else document.documentElement.classList.remove('dark'), document.body.classList.remove('dark');
  };

  // Load saved preference or system preference
  const saved = localStorage.getItem(key);
  if(saved) apply(saved);
  else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(prefersDark ? 'dark' : 'light');
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(key, next); } catch(e){}
    // update button icon
    if(toggle) toggle.textContent = next === 'dark' ? '🌙' : '☀️';
  }

  if(toggle) {
    toggle.addEventListener('click', toggleTheme);
    // set initial icon
    toggle.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
  }

  // expose for debugging
  window.ChessHubTheme = { toggle: toggleTheme, apply };
})();
