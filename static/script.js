function getCurrentTheme() {
  return localStorage.getItem('theme') ?? 'light'; // light or dark
}

function isThemeButton(element) {
  if (!element) {
    return false;
  }
  const cls = element.getAttribute('class');
  return cls && (cls.indexOf('ColorModeToggle') > 0 || cls.indexOf('toggleButton') > 0);
}

function getThemeButton() {
  const btnElements = document.querySelectorAll('#__docusaurus > .navbar > .navbar__inner > .navbar__items--right button');
  return Array.from(btnElements).find(element => isThemeButton(element));
}

function listenThemeChange(callback, listenEventOptions) {
  const btnElement = getThemeButton();
  if (btnElement) {
    const fnCallback = () => {
      setTimeout(() => {
        callback(getCurrentTheme());
      }, 200);
    }
    btnElement.addEventListener('click', fnCallback, listenEventOptions);
  }
}

function lookupElement(element, fnCondition) {
  if (!element)
    return null;

  return fnCondition(element) ? element : lookupElement(element.parentNode, fnCondition);
}
