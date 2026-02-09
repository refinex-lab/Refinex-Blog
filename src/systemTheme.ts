const DARK_CLASS = "dark";
const LIGHT_CLASS = "light";

const applyThemeClass = (isDark: boolean) => {
  const root = document.documentElement;
  root.classList.toggle(DARK_CLASS, isDark);
  root.classList.toggle(LIGHT_CLASS, !isDark);
};

export const setupSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const updateTheme = (event: MediaQueryList | MediaQueryListEvent) => {
    applyThemeClass(event.matches);
  };

  updateTheme(mediaQuery);

  mediaQuery.addEventListener("change", updateTheme);
};
