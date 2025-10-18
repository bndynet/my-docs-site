function getCurrentTheme() {
  return localStorage.getItem('theme') ?? 'light'; // light or dark
}