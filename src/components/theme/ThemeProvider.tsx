"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useSyncExternalStore, type ReactNode } from "react";

export type Theme = "dark" | "light";
export const THEME_KEY = "px-theme";
const EVENT = "px-theme-change";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeContext = createContext<Ctx | null>(null);

/**
 * Inline script executed before hydration so the correct theme is applied
 * on first paint (no flash). Dark is the brand default; a stored choice wins.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.theme=t;}catch(e){}})();`;

function readStored(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb); // other tabs
  window.addEventListener(EVENT, cb); // this tab
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server snapshot is always "dark"; the client re-renders with the stored
  // value right after hydration without a mismatch error.
  const theme = useSyncExternalStore(subscribe, readStored, () => "dark" as Theme);

  // React drops the pre-hydration data-theme attribute on <html> while
  // hydrating, so re-apply it before paint whenever the theme changes.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    // brief colour-only transition so the switch feels intentional, not jarring
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 400);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
