import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Palette,
  DollarSign,
  Wallet,
  Check,
  FileSpreadsheet,
  Circle,
} from "lucide-react";
import { ThemeColorKey, THEME_PRESETS, CURRENCIES, CartItem, ParticleStyle, UiStyle, UI_STYLES } from "../types";
import { sounds } from "../utils/soundEffects";
import { exportCartToCSV } from "../utils/csvExport";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  themeColor: ThemeColorKey;
  onThemeColorChange: (color: ThemeColorKey) => void;
  uiStyle?: UiStyle;
  onUiStyleChange?: (style: UiStyle) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  particlesEnabled: boolean;
  onToggleParticles: () => void;
  particleStyle: ParticleStyle;
  onParticleStyleChange: (style: ParticleStyle) => void;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  budgetLimit: number;
  onUpdateBudget: (limit: number) => void;
  items?: CartItem[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  themeColor,
  onThemeColorChange,
  uiStyle = "classic",
  onUiStyleChange,
  soundEnabled,
  onToggleSound,
  particlesEnabled,
  onToggleParticles,
  particleStyle,
  onParticleStyleChange,
  currency,
  onCurrencyChange,
  budgetLimit,
  onUpdateBudget,
  items = [],
}) => {
  const activePreset = THEME_PRESETS[themeColor] || THEME_PRESETS.fuchsia;
  const currentSymbol = CURRENCIES[currency]?.symbol || "Rs.";

  if (!isOpen) return null;

  const PARTICLE_OPTIONS: Array<{ id: ParticleStyle; label: string; icon: string; desc: string }> = [
    { id: "bubbles", label: "3D Soap Bubbles", icon: "🧼", desc: "Interactive popping bubbles" },
    { id: "stars", label: "Cosmic Stars", icon: "✨", desc: "Twinkling 4-point star sparkles" },
    { id: "coins", label: "Gold Coins", icon: "🪙", desc: "Floating 3D metallic coins" },
    { id: "fireflies", label: "Neon Fireflies", icon: "💡", desc: "Soft ambient pulsing light orbs" },
    { id: "snow", label: "Snowflakes", icon: "❄️", desc: "Gentle falling winter snow" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-2xl transition-all duration-300 ${
            isDarkMode
              ? "bg-slate-900/95 border-white/20 text-white shadow-fuchsia-950/50"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50"
          }`}
        >
          {/* Header */}
          <div className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${activePreset.gradient} text-white shadow-md`}>
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">App Settings & Preferences</h2>
                <p className="text-[11px] opacity-75 font-semibold">Customize theme, particles, sounds & limits</p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-white/5 hover:bg-white/15 border-white/10 text-slate-300"
                  : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Light & Dark Mode Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 opacity-80">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Display Mode (Dark / Light)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    if (!isDarkMode) onToggleDarkMode();
                    sounds.playToggle();
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs border transition-all cursor-pointer ${
                    isDarkMode
                      ? "bg-gradient-to-r from-indigo-600 to-slate-900 text-white border-indigo-400/80 shadow-lg ring-2 ring-indigo-500/50"
                      : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span>Dark Mode 🌙</span>
                </button>

                <button
                  onClick={() => {
                    if (isDarkMode) onToggleDarkMode();
                    sounds.playToggle();
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs border transition-all cursor-pointer ${
                    !isDarkMode
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 border-amber-300 shadow-lg ring-2 ring-amber-400/50"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode ☀️</span>
                </button>
              </div>
            </div>

            {/* 2. Theme Color Selection Wheel & Swatches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 opacity-80">
                  <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                  Color Selection Circle Wheel & Swatches
                </label>
                <span className="text-[10px] font-bold text-fuchsia-400">{activePreset.name}</span>
              </div>

              {/* Color Selection Circle Wheel & Preset Swatches Container */}
              <div className="p-3.5 rounded-2xl border bg-white/5 border-white/10 flex flex-col gap-3">
                {/* Rainbow Color Selection Circle Wheel Button */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border bg-white/5 border-white/10">
                  <div className="flex items-center gap-3">
                    {/* Interactive Rainbow Color Wheel Button */}
                    <div className="relative group cursor-pointer">
                      <div
                        className="w-11 h-11 rounded-full p-0.5 shadow-xl transition-transform hover:scale-105 flex items-center justify-center ring-2 ring-white/30"
                        style={{
                          background:
                            "conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff00ff, #ff0000)",
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shadow-inner border border-white/80"
                          style={{ backgroundColor: activePreset.circleColor }}
                        >
                          <Palette className="w-3.5 h-3.5 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <input
                        type="color"
                        value={activePreset.circleColor}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          // Find closest theme preset by color match or set closest key
                          const matchKey = (Object.keys(THEME_PRESETS) as ThemeColorKey[]).find(
                            (k) => THEME_PRESETS[k].circleColor.toLowerCase() === val
                          );
                          if (matchKey) {
                            onThemeColorChange(matchKey);
                          } else {
                            // Cycle or match nearest preset
                            const keys = Object.keys(THEME_PRESETS) as ThemeColorKey[];
                            const hash = Math.abs(val.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
                            onThemeColorChange(keys[hash % keys.length]);
                          }
                          sounds.playToggle();
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Click to open Color Wheel Picker 🎡"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>Color Wheel Picker 🎡</span>
                      </div>
                      <div className="text-[10px] opacity-75 font-medium">
                        Click wheel to select custom favorite color ({activePreset.circleColor})
                      </div>
                    </div>
                  </div>

                  {/* Hex Color Display Badge */}
                  <div
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white border border-white/20 shadow-sm"
                    style={{ backgroundColor: activePreset.circleColor }}
                  >
                    {activePreset.circleColor}
                  </div>
                </div>

                {/* Color Selection Swatch Circles Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                  {(Object.keys(THEME_PRESETS) as ThemeColorKey[]).map((key) => {
                    const preset = THEME_PRESETS[key];
                    const isSelected = themeColor === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onThemeColorChange(key);
                          sounds.playToggle();
                        }}
                        title={`${preset.name} (${preset.emoji})`}
                        className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-lg ${
                          isSelected
                            ? "ring-4 ring-white/90 scale-110 shadow-2xl z-10"
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${preset.circleColor}, #000)`,
                          boxShadow: isSelected ? `0 0 15px ${preset.circleColor}` : undefined,
                        }}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        ) : (
                          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            {preset.emoji}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2B. UI Personality Button & Vibe Style (Sigma 🗿, Pookie 🎀, Cute 🦄, Angry 🔥) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 opacity-80">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  UI Personality & Button Style
                </label>
                <span className="text-[10px] font-bold text-yellow-400">
                  {UI_STYLES[uiStyle]?.tagline}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(UI_STYLES) as UiStyle[]).map((stKey) => {
                  const styleConfig = UI_STYLES[stKey];
                  const isSelected = uiStyle === stKey;
                  return (
                    <button
                      key={stKey}
                      onClick={() => {
                        if (onUiStyleChange) onUiStyleChange(stKey);
                        sounds.playToggle();
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-yellow-500/20 border-yellow-400 text-yellow-300 ring-2 ring-yellow-500/40 shadow-lg scale-102"
                          : isDarkMode
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                          : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{styleConfig.icon}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-yellow-400 text-slate-950" : "bg-white/10 text-slate-400"
                        }`}>
                          {styleConfig.badge}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-black flex items-center gap-1">
                          {styleConfig.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-yellow-400 ml-auto" />}
                        </div>
                        <div className="text-[9px] opacity-75 font-medium line-clamp-1 mt-0.5">
                          {styleConfig.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Audio & Particle Effects Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Sound Effects */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
              }`}>
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <div className="text-xs font-black">Sound Effects</div>
                    <div className="text-[10px] opacity-70 font-semibold">{soundEnabled ? "Audio Enabled" : "Muted"}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onToggleSound();
                    sounds.playToggle();
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                    soundEnabled ? "bg-emerald-500" : "bg-slate-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: soundEnabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>

              {/* Background Particles Enable/Disable */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
              }`}>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-black">3D Particles</div>
                    <div className="text-[10px] opacity-70 font-semibold">{particlesEnabled ? "Active Glow" : "Disabled"}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onToggleParticles();
                    sounds.playToggle();
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                    particlesEnabled ? "bg-amber-500" : "bg-slate-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: particlesEnabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>
            </div>

            {/* 3B. Particle Type / Style Options Selection */}
            {particlesEnabled && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 opacity-80">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Particle Style Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PARTICLE_OPTIONS.map((opt) => {
                    const isSelected = particleStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onParticleStyleChange(opt.id);
                          sounds.playToggle();
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/40 shadow-lg"
                            : isDarkMode
                            ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                            : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{opt.icon}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="mt-1">
                          <div className="text-xs font-bold leading-tight">{opt.label}</div>
                          <div className="text-[9px] opacity-70 font-medium truncate">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Currency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider flex items-center justify-between opacity-80">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Preferred Currency & Auto-Conversion
                </span>
                <span className="text-[10px] text-emerald-400 font-bold lowercase">Real Exchange Rates</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(CURRENCIES).map((currKey) => {
                  const curr = CURRENCIES[currKey];
                  const isSelected = currency === currKey;
                  return (
                    <button
                      key={currKey}
                      onClick={() => {
                        onCurrencyChange(currKey);
                        sounds.playClick();
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 shadow-lg"
                          : isDarkMode
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                          : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{curr.flag}</span>
                        <span className="text-xs font-black">{curr.code}</span>
                      </div>
                      <span className="text-[10px] font-semibold opacity-75">{curr.symbol} • {curr.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Budget Limit Editor */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2 opacity-80">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                Monthly Shopping Budget Limit
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold opacity-70">
                    {currentSymbol}
                  </span>
                  <input
                    type="number"
                    value={budgetLimit || ""}
                    onChange={(e) => onUpdateBudget(parseFloat(e.target.value) || 0)}
                    placeholder="Enter budget (e.g. 15000)"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-extrabold outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDarkMode
                        ? "bg-white/5 border-white/15 text-white"
                        : "bg-slate-100 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <button
                  onClick={() => {
                    onUpdateBudget(budgetLimit + 5000);
                    sounds.playCashRegister();
                  }}
                  className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl border border-indigo-400/30 cursor-pointer shadow-md transition-all shrink-0"
                >
                  + {currentSymbol} 5,000
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className={`px-5 py-3.5 border-t flex items-center justify-between ${
            isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
          }`}>
            <button
              onClick={() => exportCartToCSV(items, budgetLimit, currency)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 cursor-pointer transition-all border border-emerald-400/40 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-black text-xs rounded-2xl shadow-xl hover:brightness-110 cursor-pointer transition-all border border-fuchsia-400/40"
            >
              Done & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
