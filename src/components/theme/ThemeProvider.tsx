"use client";

import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";

/**
 * Theme is locked to dark — the brand look. The light palette still exists in
 * globals.css under [data-theme="light"] should it ever be wanted again; the
 * switch UI was removed by request. `useTheme()` is kept so components that
 * consult the theme keep working unchanged.
 */
export type Theme = "dark" | "light";
export const THEME_KEY = "px-theme";

type Ctx = { theme: Theme };
const ThemeContext = createContext<Ctx>({ theme: "dark" });

/** Runs before hydration: pin dark and clear any stored light preference. */
export const themeInitScript = `(function(){try{document.documentElement.dataset.theme="dark";localStorage.removeItem("${THEME_KEY}");}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = "dark";
  }, []);
  return <ThemeContext.Provider value={{ theme: "dark" }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
