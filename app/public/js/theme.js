(function(){
  const key = 'chesshub_theme';
  
  // Apply theme to document
  const apply = (mode) => {
    if(mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
  };

  // Get current theme from localStorage or system preference
  const getTheme = () => {
    const saved = localStorage.getItem(key);
    if(saved) return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  // Apply theme immediately (before DOM is ready to prevent flash)
  const currentTheme = getTheme();
  apply(currentTheme);

  function init() {
    const toggle = document.getElementById('theme-toggle');
    
    // Ensure theme is applied
    const theme = getTheme();
    apply(theme);
    
    // Update button icon based on current theme
    if(toggle) {
      const isDark = document.body.classList.contains('dark');
      toggle.textContent = isDark ? '☀️' : '🌙';
    }

    function toggleTheme() {
      const isDark = document.body.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      apply(next);
      try { 
        localStorage.setItem(key, next); 
      } catch(e){
        console.error('Error saving theme preference:', e);
      }
      // update button icon
      if(toggle) toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    }

    if(toggle) {
      toggle.addEventListener('click', toggleTheme);
    }
  }

  // Run on DOM ready
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expose for debugging
  window.ChessHubTheme = { apply, getTheme };
})();
