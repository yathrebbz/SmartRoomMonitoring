import { useCallback, useEffect, useState } from "react";

import { useMediaQuery } from "./useMediaQuery";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "smart-room-theme";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Stockage indisponible (navigation privée, etc.).
  }
  return "system";
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolved: "light" | "dark" = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Stockage indisponible : le thème ne sera pas mémorisé.
    }
  }, [preference]);

  const cycle = useCallback(() => {
    setPreference((current) => (current === "system" ? "light" : current === "light" ? "dark" : "system"));
  }, []);

  return { preference, resolved, cycle };
}
