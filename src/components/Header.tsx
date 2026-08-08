import React from "react";
import { motion } from "motion/react";
import { ShoppingCart, Volume2, VolumeX, Settings } from "lucide-react";
import { CURRENCIES, CurrencyConfig, THEME_PRESETS, ThemeColorKey } from "../types";
import { sounds } from "../utils/soundEffects";

interface HeaderProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalSpent: number;
  itemCount: number;
  themeColor: ThemeColorKey;
  onThemeColorChange: (color: ThemeColorKey) => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  isDarkMode,
  soundEnabled,
  onToggleSound,
  totalSpent,
  itemCount,
  themeColor,
  onOpenSettings,
}) => {
  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;
  const activePreset = THEME_PRESETS[themeColor] || THEME_PRESETS.fuchsia;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-2xl transition-all duration-300 ${
      isDarkMode
        ? "bg-slate-950/85 border-white/10 text-white"
        : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50"
    }`}>
      <div className="w-full px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2">
        {/* App Title & VIP 3D Box Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* VIP 3D Rotating Box Logo */}
          <div className="relative group perspective-500 cursor-pointer shrink-0">
            <motion.div
              animate={{ rotateY: [0, 360], rotateX: [10, -10, 10] }}
              transition={{
                rotateY: { repeat: Infinity, duration: 8, ease: "linear" },
                rotateX: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 relative transform-style-3d transform-gpu"
            >
              {/* 3D Cube Container */}
              <div
                className={`w-full h-full rounded-2xl bg-gradient-to-tr ${activePreset.gradient} p-0.5 shadow-2xl border-2 border-white/60 relative overflow-hidden flex items-center justify-center`}
                style={{ boxShadow: `0 8px 24px ${activePreset.glowColor}, inset 0 2px 6px rgba(255,255,255,0.7)` }}
              >
                {/* 3D Bevel Gloss overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-black/50 pointer-events-none"></div>

                {/* 3D Inner Content */}
                <div className="flex items-center justify-center gap-0.5 z-10 transform translate-z-2">
                  <span className="text-xl sm:text-2xl font-black italic text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)] tracking-tighter">
                    S
                  </span>
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full border border-black animate-ping"></span>
                  </div>
                </div>

                {/* Inner 3D Glass Layer */}
                <div className="absolute inset-1 rounded-xl bg-white/10 backdrop-blur-[1px] border border-white/20"></div>
              </div>
            </motion.div>

            {/* Glowing Neon Aura */}
            <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-r ${activePreset.gradient} blur-md opacity-70 -z-10 animate-pulse`}></div>
          </div>

          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tighter flex items-center gap-1 sm:gap-1.5 drop-shadow-sm leading-tight">
              <span className={isDarkMode ? "text-white" : "text-slate-900"}>SMART CART</span>
              <span className={`${activePreset.textAccent} font-extrabold tracking-normal`}>AI</span>
              <span className={`hidden xs:inline-block text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full ${activePreset.badgeBg} shadow-sm border`}>
                3D VIP
              </span>
            </h1>
            <p className={`text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-bold leading-none mt-0.5 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              Smart Shopping Engine
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Market Status & Quick Cart Summary */}
          <div className={`hidden sm:flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs ${
            isDarkMode
              ? "bg-white/5 border-white/15 text-slate-200"
              : "bg-slate-100 border-slate-300 text-slate-800"
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse"></span>
            <span className="font-bold tracking-wide uppercase text-[10px]">
              {currency}
            </span>
            <span className="opacity-30">•</span>
            <span className="text-indigo-400 dark:text-indigo-300 font-extrabold">{itemCount} items</span>
            <span className="opacity-30">•</span>
            <span className={`${activePreset.textAccent} font-black`}>
              {currentCurr.symbol} {totalSpent.toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onToggleSound();
              sounds.playToggle();
            }}
            title={soundEnabled ? "Sound Effects ON" : "Sound Effects OFF"}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
              isDarkMode
                ? "bg-white/10 hover:bg-white/15 border-white/15 text-slate-200"
                : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
            }`}
          >
            {soundEnabled ? <Volume2 className={`w-4 h-4 ${activePreset.textAccent}`} /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </motion.button>

          {/* Primary Settings Gear Button */}
          {onOpenSettings && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                onOpenSettings();
                sounds.playClick();
              }}
              title="Open All App Settings"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-white/40 transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5 shadow-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:brightness-110 shrink-0"
            >
              <Settings className="w-4 h-4 animate-spin-slow text-white" />
              <span className="text-xs font-extrabold tracking-tight">Settings</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};


