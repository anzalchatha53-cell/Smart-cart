import React from "react";
import { motion } from "motion/react";
import { ShoppingBag, Bot, QrCode, PieChart, UtensilsCrossed, Tag } from "lucide-react";
import { THEME_PRESETS, ThemeColorKey } from "../types";
import { sounds } from "../utils/soundEffects";

export type TabId = "cart" | "ai" | "barcode" | "budget" | "recipes" | "deals";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  cartBadgeCount: number;
  themeColor?: ThemeColorKey;
  isDarkMode?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  cartBadgeCount,
  themeColor = "fuchsia",
  isDarkMode = true,
}) => {
  const activePreset = THEME_PRESETS[themeColor] || THEME_PRESETS.fuchsia;

  const tabs = [
    { id: "cart" as TabId, label: "Cart", icon: ShoppingBag, badge: cartBadgeCount },
    { id: "ai" as TabId, label: "AI", icon: Bot, highlight: true },
    { id: "barcode" as TabId, label: "Scan", icon: QrCode },
    { id: "budget" as TabId, label: "Stats", icon: PieChart },
    { id: "recipes" as TabId, label: "Recipes", icon: UtensilsCrossed },
    { id: "deals" as TabId, label: "Deals", icon: Tag },
  ];

  return (
    <div className="w-full px-3 sm:px-4 pt-3">
      <div className={`flex items-center gap-1.5 p-1.5 border backdrop-blur-xl rounded-2xl shadow-xl overflow-x-auto no-scrollbar scroll-smooth transition-colors duration-300 ${
        isDarkMode
          ? "bg-black/50 border-white/10"
          : "bg-white/80 border-slate-200 shadow-slate-200/60"
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onTabChange(tab.id);
                sounds.playClick();
              }}
              className={`relative flex-1 min-w-[70px] sm:min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? "text-white font-extrabold shadow-lg"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={`absolute inset-0 bg-gradient-to-r ${activePreset.gradient} rounded-xl shadow-lg border border-white/30`}
                  style={{ boxShadow: `0 0 15px ${activePreset.glowColor}` }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Icon className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                isActive
                  ? "text-white"
                  : tab.highlight
                  ? activePreset.textAccent
                  : isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`} />
              <span className="relative z-10 tracking-wide text-[11px] sm:text-xs">{tab.label}</span>

              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`relative z-10 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white text-slate-950 shadow"
                      : "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-sm"
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {tab.highlight && !isActive && (
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${activePreset.textAccent} animate-ping bg-current`}></span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

