export type CategoryType =
  | "Household"
  | "Produce"
  | "Dairy"
  | "Bakery"
  | "Meat"
  | "Snacks"
  | "Beverages"
  | "Pantry"
  | "Other";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  unit?: string;
  barcode?: string;
  checked: boolean;
  addedAt: number;
  notes?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateToUSD: number; // For estimated conversions
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  PKR: { code: "PKR", symbol: "Rs.", name: "Pakistani Rupee", flag: "🇵🇰", rateToUSD: 278 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rateToUSD: 83.5 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rateToUSD: 1 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rateToUSD: 0.92 },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪", rateToUSD: 3.67 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rateToUSD: 0.78 },
  SAR: { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦", rateToUSD: 3.75 },
};

/**
 * Accurately converts financial amounts between supported world currencies
 */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string
): number {
  if (!amount || fromCode === toCode) return amount;
  const fromRate = CURRENCIES[fromCode]?.rateToUSD || CURRENCIES.PKR.rateToUSD;
  const toRate = CURRENCIES[toCode]?.rateToUSD || CURRENCIES.PKR.rateToUSD;
  
  // Calculate converted rate via USD baseline
  const amountInUSD = amount / fromRate;
  const rawConverted = amountInUSD * toRate;

  // Rounding based on currency magnitude
  if (toCode === "USD" || toCode === "EUR" || toCode === "GBP") {
    return Math.round(rawConverted * 100) / 100; // 2 decimal precision
  } else if (toCode === "AED" || toCode === "SAR") {
    return Math.round(rawConverted * 10) / 10;
  } else {
    return Math.round(rawConverted); // Whole numbers for PKR / INR
  }
}

export interface CategoryMeta {
  name: CategoryType;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORY_METAS: Record<CategoryType, CategoryMeta> = {
  Produce: { name: "Produce", emoji: "🍎", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
  Dairy: { name: "Dairy", emoji: "🥛", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  Bakery: { name: "Bakery", emoji: "🍞", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  Meat: { name: "Meat", emoji: "🥩", color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
  Snacks: { name: "Snacks", emoji: "🍫", color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  Beverages: { name: "Beverages", emoji: "🥤", color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  Household: { name: "Household", emoji: "🧼", color: "text-teal-400", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/30" },
  Pantry: { name: "Pantry", emoji: "🍚", color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  Other: { name: "Other", emoji: "📦", color: "text-slate-400", bgColor: "bg-slate-500/10", borderColor: "border-slate-500/30" },
};

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
  suggestedItems?: Array<{
    name: string;
    price: number;
    quantity: number;
    category: CategoryType;
    unit?: string;
  }>;
  modelPersona?: string;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  price: number;
  category: CategoryType;
  unit: string;
  brand?: string;
}

export interface ShoppingHistoryEntry {
  id: string;
  date: string;
  totalItems: number;
  totalCost: number;
  currency: string;
  items: CartItem[];
}

export type ThemeColorKey = "fuchsia" | "cyan" | "emerald" | "amber" | "purple" | "rose" | "indigo" | "teal" | "orange";

export type ParticleStyle = "bubbles" | "stars" | "coins" | "fireflies" | "snow";

export type UiStyle = "classic" | "sigma" | "pookie" | "cute" | "angry";

export interface UiStyleConfig {
  id: UiStyle;
  name: string;
  icon: string;
  badge: string;
  description: string;
  buttonRadius: string;
  borderStyle: string;
  tagline: string;
}

export const UI_STYLES: Record<UiStyle, UiStyleConfig> = {
  classic: {
    id: "classic",
    name: "Classic Sleek",
    icon: "✨",
    badge: "MODERN",
    description: "Smooth gradients with balanced glassmorphic elegance",
    buttonRadius: "rounded-2xl",
    borderStyle: "border-white/10",
    tagline: "Professional & Balanced",
  },
  sigma: {
    id: "sigma",
    name: "Sigma Chad",
    icon: "🗿",
    badge: "ALPHA",
    description: "Sharp metallic angles, high-contrast neon borders & Chad energy",
    buttonRadius: "rounded-none",
    borderStyle: "border-slate-400/50 uppercase tracking-wider",
    tagline: "Unstoppable Productivity 🗿",
  },
  pookie: {
    id: "pookie",
    name: "Pookie Bear",
    icon: "🎀",
    badge: "SO SOFT",
    description: "Super soft pill shapes, pastel pink glow & ribbon sparkles",
    buttonRadius: "rounded-full",
    borderStyle: "border-pink-300/40 shadow-pink-500/20",
    tagline: "Cute Pastel Vibes 🎀",
  },
  cute: {
    id: "cute",
    name: "Cute Kawaii",
    icon: "🦄",
    badge: "BUBBLE POP",
    description: "Playful 3D rounded bubbles, candy colors & bouncy feedback",
    buttonRadius: "rounded-3xl",
    borderStyle: "border-purple-400/40 shadow-purple-500/30",
    tagline: "Fun & Playful 🌸",
  },
  angry: {
    id: "angry",
    name: "Rage Mode",
    icon: "🔥",
    badge: "HARDCORE",
    description: "Aggressive flame red borders, jagged edges & fiery energy",
    buttonRadius: "rounded-lg",
    borderStyle: "border-2 border-rose-600 shadow-rose-600/40",
    tagline: "Crush Your Goals 🔥",
  },
};

export interface ThemePreset {
  key: ThemeColorKey;
  name: string;
  emoji: string;
  gradient: string;
  textAccent: string;
  badgeBg: string;
  borderAccent: string;
  btnBg: string;
  glowColor: string;
  circleColor: string; // CSS color string for color selection circle UI
}

export const THEME_PRESETS: Record<ThemeColorKey, ThemePreset> = {
  fuchsia: {
    key: "fuchsia",
    name: "Neon Pink",
    emoji: "💖",
    gradient: "from-fuchsia-500 via-purple-600 to-indigo-600",
    textAccent: "text-fuchsia-400",
    badgeBg: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30",
    borderAccent: "border-fuchsia-500/40",
    btnBg: "from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500",
    glowColor: "rgba(217, 70, 239, 0.4)",
    circleColor: "#d946ef",
  },
  cyan: {
    key: "cyan",
    name: "Cyber Cyan",
    emoji: "💎",
    gradient: "from-cyan-400 via-blue-600 to-indigo-600",
    textAccent: "text-cyan-400",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    borderAccent: "border-cyan-500/40",
    btnBg: "from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.4)",
    circleColor: "#06b6d4",
  },
  emerald: {
    key: "emerald",
    name: "Matrix Emerald",
    emoji: "🌿",
    gradient: "from-emerald-400 via-teal-600 to-cyan-600",
    textAccent: "text-emerald-400",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    borderAccent: "border-emerald-500/40",
    btnBg: "from-teal-600 via-emerald-600 to-green-500 hover:from-teal-500 hover:to-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
    circleColor: "#10b981",
  },
  amber: {
    key: "amber",
    name: "Gold Amber",
    emoji: "☀️",
    gradient: "from-amber-400 via-orange-500 to-rose-600",
    textAccent: "text-amber-400",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    borderAccent: "border-amber-500/40",
    btnBg: "from-orange-600 via-amber-600 to-yellow-500 hover:from-orange-500 hover:to-amber-400",
    glowColor: "rgba(245, 158, 11, 0.4)",
    circleColor: "#f59e0b",
  },
  purple: {
    key: "purple",
    name: "Electric Violet",
    emoji: "💜",
    gradient: "from-purple-500 via-violet-600 to-indigo-600",
    textAccent: "text-purple-400",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    borderAccent: "border-purple-500/40",
    btnBg: "from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-purple-500",
    glowColor: "rgba(168, 85, 247, 0.4)",
    circleColor: "#a855f7",
  },
  rose: {
    key: "rose",
    name: "Ruby Rose",
    emoji: "🌹",
    gradient: "from-rose-500 via-red-600 to-pink-600",
    textAccent: "text-rose-400",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/30",
    borderAccent: "border-rose-500/40",
    btnBg: "from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-rose-500",
    glowColor: "rgba(244, 63, 94, 0.4)",
    circleColor: "#f43f5e",
  },
  indigo: {
    key: "indigo",
    name: "Royal Indigo",
    emoji: "🌌",
    gradient: "from-indigo-500 via-blue-700 to-purple-700",
    textAccent: "text-indigo-400",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
    borderAccent: "border-indigo-500/40",
    btnBg: "from-blue-700 via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-indigo-500",
    glowColor: "rgba(99, 102, 241, 0.4)",
    circleColor: "#6366f1",
  },
  teal: {
    key: "teal",
    name: "Ocean Teal",
    emoji: "🌊",
    gradient: "from-teal-400 via-emerald-600 to-cyan-700",
    textAccent: "text-teal-400",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    borderAccent: "border-teal-500/40",
    btnBg: "from-cyan-700 via-teal-600 to-emerald-600 hover:from-cyan-600 hover:to-teal-500",
    glowColor: "rgba(20, 184, 166, 0.4)",
    circleColor: "#14b8a6",
  },
  orange: {
    key: "orange",
    name: "Sunset Blaze",
    emoji: "🌅",
    gradient: "from-orange-500 via-amber-600 to-rose-600",
    textAccent: "text-orange-400",
    badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/30",
    borderAccent: "border-orange-500/40",
    btnBg: "from-rose-600 via-orange-600 to-amber-500 hover:from-rose-500 hover:to-orange-500",
    glowColor: "rgba(249, 115, 22, 0.4)",
    circleColor: "#f97316",
  },
};

