import { useState, useEffect, useCallback } from "react";

export type AppTheme = "light" | "dark" | "system";

export interface AppSettings {
  theme: AppTheme;
  brightness: number; // 50 - 100
  enterToSend: boolean;
  showTimestamps: boolean;
  autoScroll: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  brightness: 100,
  enterToSend: true,
  showTimestamps: true,
  autoScroll: true,
};

const SETTINGS_KEY = "helpmind_app_settings_v1";

function getStoredSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === "dark" || parsed.theme === "system" ? parsed.theme : "light",
      brightness:
        typeof parsed.brightness === "number" && parsed.brightness >= 50 && parsed.brightness <= 100
          ? parsed.brightness
          : 100,
      enterToSend: typeof parsed.enterToSend === "boolean" ? parsed.enterToSend : true,
      showTimestamps: typeof parsed.showTimestamps === "boolean" ? parsed.showTimestamps : true,
      autoScroll: typeof parsed.autoScroll === "boolean" ? parsed.autoScroll : true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Global in-memory state & subscriber registry so all components sync reactively
let currentSettings: AppSettings = getStoredSettings();
const listeners = new Set<(settings: AppSettings) => void>();

export function applyThemeAndDisplay(settings: AppSettings) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const root = document.documentElement;

  // 1. Theme application (Light, Dark, System)
  let isDark = false;
  if (settings.theme === "dark") {
    isDark = true;
  } else if (settings.theme === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // 2. Application visual brightness filter (50% - 100%)
  if (settings.brightness < 100) {
    root.style.filter = `brightness(${settings.brightness}%)`;
  } else {
    root.style.filter = "";
  }
}

// Initialize immediately in browser context
if (typeof window !== "undefined") {
  applyThemeAndDisplay(currentSettings);

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => {
    if (currentSettings.theme === "system") {
      applyThemeAndDisplay(currentSettings);
    }
  };
  try {
    mediaQuery.addEventListener("change", handleMediaChange);
  } catch {
    mediaQuery.addListener(handleMediaChange);
  }
}

export function updateAppSettings(partial: Partial<AppSettings>) {
  currentSettings = {
    ...currentSettings,
    ...partial,
  };

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
  } catch (err) {
    console.warn("Failed to persist HelpMind settings to localStorage:", err);
  }

  applyThemeAndDisplay(currentSettings);
  listeners.forEach((fn) => fn(currentSettings));
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);

    const handler = (newSettings: AppSettings) => {
      setSettings(newSettings);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const update = useCallback((partial: Partial<AppSettings>) => {
    updateAppSettings(partial);
  }, []);

  const resetDisplay = useCallback(() => {
    updateAppSettings({ brightness: 100 });
  }, []);

  return {
    settings,
    updateSettings: update,
    resetDisplay,
  };
}
