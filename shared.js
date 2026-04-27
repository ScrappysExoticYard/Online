function toggleColorScheme() {
  const body = document.body;
  const toggle = document.getElementById('color-toggle');
  body.classList.toggle('dark-mode');
  toggle.classList.toggle('active');
  localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}

document.addEventListener('DOMContentLoaded', function() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('color-toggle').classList.add('active');
  }
});
