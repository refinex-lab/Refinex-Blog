import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ThemeMode } from "../config/site";
import { ThemeContext } from "./useTheme";

const STORAGE_KEY = "refinex-theme";
const DARK_CLASS = "dark";
const LIGHT_CLASS = "light";

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyThemeClass = (mode: "light" | "dark") => {
  const root = document.documentElement;
  root.classList.remove(LIGHT_CLASS, DARK_CLASS);
  root.classList.add(mode);
};

export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    const stored = window.localStorage.getItem(storageKey) as ThemeMode | null;
    return stored ?? defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    return getSystemTheme();
  });

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    // React state drives DOM + localStorage; no setState in the effect body.
    applyThemeClass(resolvedTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, theme);
    }
  }, [resolvedTheme, storageKey, theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      },
    }),
    [resolvedTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

