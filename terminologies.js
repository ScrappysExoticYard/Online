// =============================================
//  SCRAPPY'S EXOTIC YARD — Terminologies JS
// =============================================

function toggleColorScheme() {
  const body = document.body;
  const toggle = document.getElementById('color-toggle');
  body.classList.toggle('dark-mode');
  toggle.classList.toggle('active');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}

document.addEventListener('DOMContentLoaded', function() {
  // Dark mode is ON by default — only disable if explicitly set to false
  const storedPref = localStorage.getItem('darkMode');
  if (storedPref === null || storedPref === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('color-toggle').classList.add('active');
  }
});
