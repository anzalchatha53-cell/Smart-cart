import { CartItem, CURRENCIES } from "../types";
import { INITIAL_CART_ITEMS } from "./sampleData";

const STORAGE_KEYS = {
  CART_ITEMS: "smart_cart_ai_items_v2",
  BUDGET_LIMIT: "smart_cart_ai_budget_limit_v2",
  CURRENCY: "smart_cart_ai_currency_v2",
  IS_DARK_MODE: "smart_cart_ai_dark_mode_v2",
  SOUND_ENABLED: "smart_cart_ai_sound_v2",
  PARTICLES_ENABLED: "smart_cart_ai_particles_v2",
  CUSTOM_SUGGESTIONS: "smart_cart_ai_custom_suggestions_v2",
};

export interface CustomSuggestion {
  name: string;
  price: number;
  unit?: string;
  isCustom?: boolean;
}

export const getCustomSuggestions = (): CustomSuggestion[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_SUGGESTIONS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const addCustomSuggestion = (item: { name: string; price: number; unit?: string }) => {
  if (typeof window === "undefined" || !item.name.trim()) return;
  try {
    const existing = getCustomSuggestions();
    const cleanName = item.name.trim();
    // Don't duplicate exact name
    const filtered = existing.filter((s) => s.name.toLowerCase() !== cleanName.toLowerCase());
    const updated: CustomSuggestion[] = [
      {
        name: cleanName,
        price: item.price || 0,
        unit: item.unit || "pack",
        isCustom: true,
      },
      ...filtered,
    ].slice(0, 50); // Keep last 50 custom items
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SUGGESTIONS, JSON.stringify(updated));
  } catch (e) {
    // Ignore
  }
};

export const getStoredItems = (): CartItem[] => {
  if (typeof window === "undefined") return INITIAL_CART_ITEMS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART_ITEMS);
    if (!data) return INITIAL_CART_ITEMS;
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_CART_ITEMS;
  }
};

export const saveStoredItems = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(items));
  } catch (e) {
    // Ignore
  }
};

export const getStoredBudgetLimit = (): number => {
  if (typeof window === "undefined") return 5000;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.BUDGET_LIMIT);
    if (!val) return 5000;
    return parseFloat(val) || 5000;
  } catch (e) {
    return 5000;
  }
};

export const saveStoredBudgetLimit = (limit: number) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET_LIMIT, limit.toString());
  } catch (e) {
    // Ignore
  }
};

export const getStoredCurrency = (): string => {
  if (typeof window === "undefined") return "PKR";
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (val && CURRENCIES[val]) return val;
    return "PKR";
  } catch (e) {
    return "PKR";
  }
};

export const saveStoredCurrency = (curr: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  } catch (e) {
    // Ignore
  }
};

export const getStoredDarkMode = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.IS_DARK_MODE);
    if (val === null) return true;
    return val === "true";
  } catch (e) {
    return true;
  }
};

export const saveStoredDarkMode = (isDark: boolean) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.IS_DARK_MODE, isDark ? "true" : "false");
  } catch (e) {
    // Ignore
  }
};

export const getStoredSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    if (val === null) return true;
    return val === "true";
  } catch (e) {
    return true;
  }
};

export const saveStoredSoundEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled ? "true" : "false");
  } catch (e) {
    // Ignore
  }
};

export const getStoredParticlesEnabled = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.PARTICLES_ENABLED);
    if (val === null) return true;
    return val === "true";
  } catch (e) {
    return true;
  }
};

export const saveStoredParticlesEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICLES_ENABLED, enabled ? "true" : "false");
  } catch (e) {
    // Ignore
  }
};

export const getStoredParticleStyle = (): string => {
  if (typeof window === "undefined") return "bubbles";
  try {
    const val = localStorage.getItem("smart_cart_particle_style");
    return val || "bubbles";
  } catch (e) {
    return "bubbles";
  }
};

export const saveStoredParticleStyle = (style: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("smart_cart_particle_style", style);
  } catch (e) {
    // Ignore
  }
};

export const getStoredThemeColor = (): string => {
  if (typeof window === "undefined") return "fuchsia";
  try {
    const val = localStorage.getItem("smart_cart_theme_color");
    return val || "fuchsia";
  } catch (e) {
    return "fuchsia";
  }
};

export const saveStoredThemeColor = (color: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("smart_cart_theme_color", color);
  } catch (e) {
    // Ignore
  }
};

export const getStoredCustomColor = (): string => {
  if (typeof window === "undefined") return "#d946ef";
  try {
    const val = localStorage.getItem("smart_cart_custom_color_hex");
    return val || "#d946ef";
  } catch (e) {
    return "#d946ef";
  }
};

export const saveStoredCustomColor = (hex: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("smart_cart_custom_color_hex", hex);
  } catch (e) {
    // Ignore
  }
};

export const getStoredUiStyle = (): string => {
  if (typeof window === "undefined") return "classic";
  try {
    const val = localStorage.getItem("smart_cart_ui_style");
    return val || "classic";
  } catch (e) {
    return "classic";
  }
};

export const saveStoredUiStyle = (style: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("smart_cart_ui_style", style);
  } catch (e) {
    // Ignore
  }
};

