function toggleColorScheme() {
  const body = document.body;
  const toggle = document.getElementById('color-toggle');
  body.classList.toggle('light-mode');
  toggle.classList.toggle('active');
  localStorage.setItem('lightMode', body.classList.contains('light-mode'));
}

document.addEventListener('DOMContentLoaded', function() {
  const isLightMode = localStorage.getItem('lightMode') === 'true';
  if (isLightMode) {
    document.body.classList.add('light-mode');
    document.getElementById('color-toggle').classList.add('active');
  }
});
