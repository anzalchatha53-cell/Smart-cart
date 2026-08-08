import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { TabBar, TabId } from "./components/TabBar";
import { BudgetBanner } from "./components/BudgetBanner";
import { AddItemForm } from "./components/AddItemForm";
import { CartList } from "./components/CartList";
import { AIAssistantView } from "./components/AIAssistantView";
import { BarcodeScannerModal } from "./components/BarcodeScannerModal";
import { BudgetAnalyticsView } from "./components/BudgetAnalyticsView";
import { RecipePlannerView } from "./components/RecipePlannerView";
import { DealsView } from "./components/DealsView";
import { ParticleBackground } from "./components/ParticleBackground";
import { SettingsModal } from "./components/SettingsModal";

import { CartItem, CategoryType, ThemeColorKey, THEME_PRESETS, CURRENCIES, convertCurrency, ParticleStyle, UiStyle, UI_STYLES } from "./types";
import {
  getStoredItems,
  saveStoredItems,
  getStoredBudgetLimit,
  saveStoredBudgetLimit,
  getStoredCurrency,
  saveStoredCurrency,
  getStoredDarkMode,
  saveStoredDarkMode,
  getStoredSoundEnabled,
  saveStoredSoundEnabled,
  getStoredParticlesEnabled,
  saveStoredParticlesEnabled,
  getStoredParticleStyle,
  saveStoredParticleStyle,
  getStoredThemeColor,
  saveStoredThemeColor,
  getStoredUiStyle,
  saveStoredUiStyle,
} from "./utils/storage";
import { sounds } from "./utils/soundEffects";

export default function App() {
  const [items, setItems] = useState<CartItem[]>(getStoredItems);
  const [budgetLimit, setBudgetLimit] = useState<number>(getStoredBudgetLimit);
  const [currency, setCurrency] = useState<string>(getStoredCurrency);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getStoredDarkMode);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getStoredSoundEnabled);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(getStoredParticlesEnabled);
  const [particleStyle, setParticleStyle] = useState<ParticleStyle>(() => getStoredParticleStyle() as ParticleStyle);
  const [themeColor, setThemeColor] = useState<ThemeColorKey>(() => getStoredThemeColor() as ThemeColorKey);
  const [uiStyle, setUiStyle] = useState<UiStyle>(() => getStoredUiStyle() as UiStyle);

  const [activeTab, setActiveTab] = useState<TabId>("cart");
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [budgetAlert, setBudgetAlert] = useState<string | null>(null);

  const currentCurr = CURRENCIES[currency] || CURRENCIES.PKR;

  // Sync state to local storage
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredBudgetLimit(budgetLimit);
  }, [budgetLimit]);

  useEffect(() => {
    saveStoredCurrency(currency);
  }, [currency]);

  useEffect(() => {
    saveStoredDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    saveStoredThemeColor(themeColor);
  }, [themeColor]);

  useEffect(() => {
    saveStoredSoundEnabled(soundEnabled);
    sounds.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveStoredParticlesEnabled(particlesEnabled);
  }, [particlesEnabled]);

  useEffect(() => {
    saveStoredParticleStyle(particleStyle);
  }, [particleStyle]);

  const activePreset = THEME_PRESETS[themeColor] || THEME_PRESETS.fuchsia;

  const handleCurrencyChange = (newCurr: string) => {
    if (newCurr === currency) return;
    const oldCurr = currency;
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        price: convertCurrency(item.price, oldCurr, newCurr),
      }))
    );
    if (budgetLimit > 0) {
      setBudgetLimit((prevLimit) => convertCurrency(prevLimit, oldCurr, newCurr));
    }
    setCurrency(newCurr);
  };

  // Total spent calculation
  const totalSpent = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Budget Limit Enforcement Helper
  const checkBudgetExceeded = (addedCost: number = 0, itemName?: string): boolean => {
    if (budgetLimit > 0 && totalSpent + addedCost > budgetLimit) {
      const symbol = currentCurr.symbol;
      const over = totalSpent + addedCost - budgetLimit;
      const itemInfo = itemName ? `"${itemName}"` : "this item";
      const costText = addedCost > 0 ? ` (${symbol} ${addedCost.toLocaleString()})` : "";
      const msg = `⛔ Budget Limit Reached! Adding ${itemInfo}${costText} would exceed your limit of ${symbol} ${budgetLimit.toLocaleString()} by ${symbol} ${over.toLocaleString()}. Please increase your budget limit or remove existing items.`;
      setBudgetAlert(msg);
      sounds.playError();
      return true; // Exceeded! Block addition.
    }
    return false;
  };

  // Handlers
  const handleAddItem = (newItem: {
    name: string;
    price: number;
    quantity: number;
    category?: CategoryType;
    unit?: string;
    barcode?: string;
  }): boolean => {
    const cost = newItem.price * newItem.quantity;
    if (checkBudgetExceeded(cost, newItem.name)) {
      return false;
    }

    setBudgetAlert(null);
    const item: CartItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newItem.name,
      price: newItem.price,
      quantity: newItem.quantity,
      category: newItem.category || "Household",
      barcode: newItem.barcode,
      checked: false,
      addedAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
    return true;
  };

  const handleAddMultipleItems = (
    newItems: Array<{
      name: string;
      price: number;
      quantity: number;
      category: CategoryType;
      unit?: string;
    }>
  ): boolean => {
    const totalNewCost = newItems.reduce((sum, n) => sum + (n.price * (n.quantity || 1)), 0);
    if (checkBudgetExceeded(totalNewCost, `${newItems.length} items`)) {
      return false;
    }

    setBudgetAlert(null);
    const createdItems: CartItem[] = newItems.map((n, idx) => ({
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: n.name,
      price: n.price,
      quantity: n.quantity || 1,
      category: n.category || "Other",
      unit: n.unit || "pack",
      checked: false,
      addedAt: Date.now() + idx,
    }));

    setItems((prev) => [...createdItems, ...prev]);
    return true;
  };

  const handleToggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const targetItem = items.find((i) => i.id === id);
    if (delta > 0 && targetItem) {
      if (checkBudgetExceeded(targetItem.price * delta, targetItem.name)) {
        return;
      }
    }
    setBudgetAlert(null);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setBudgetAlert(null);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearChecked = () => {
    setBudgetAlert(null);
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire shopping list?")) {
      setBudgetAlert(null);
      setItems([]);
    }
  };

  const handleCheckAll = () => {
    const allChecked = items.every((i) => i.checked);
    setItems((prev) => prev.map((i) => ({ ...i, checked: !allChecked })));
  };

  const handleDuplicateItem = (item: CartItem) => {
    const cost = item.price * item.quantity;
    if (checkBudgetExceeded(cost, item.name)) {
      return;
    }
    setBudgetAlert(null);
    const dup: CartItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: Date.now(),
      checked: false,
    };
    setItems((prev) => [dup, ...prev]);
  };

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden transition-colors duration-500 ${
        isDarkMode
          ? "bg-[#030712] text-slate-100 selection:bg-fuchsia-500 selection:text-white"
          : "bg-slate-100 text-slate-900 selection:bg-fuchsia-500 selection:text-white"
      }`}
    >
      {/* Particle Background Glow */}
      {particlesEnabled && (
        <ParticleBackground
          isDarkMode={isDarkMode}
          particleStyle={particleStyle}
        />
      )}

      {/* Outer Desktop Canvas Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none z-0 transition-all duration-500"
        style={{
          backgroundColor: isDarkMode ? activePreset.glowColor : "rgba(99, 102, 241, 0.15)",
        }}
      ></div>

      {/* Responsive Main App Shell for PC & Mobile */}
      <div className="relative z-10 max-w-4xl mx-auto min-h-screen flex flex-col px-2 sm:px-4 pb-20">
        {/* Top Main Navigation Header */}
        <Header
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          totalSpent={totalSpent}
          itemCount={items.length}
          themeColor={themeColor}
          onThemeColorChange={setThemeColor}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Tab Selector */}
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cartBadgeCount={items.filter((i) => !i.checked).length}
          themeColor={themeColor}
          isDarkMode={isDarkMode}
        />


        {/* Budget Meter */}
        <BudgetBanner
          budgetLimit={budgetLimit}
          totalSpent={totalSpent}
          currency={currency}
          onUpdateBudget={(newLimit) => {
            setBudgetLimit(newLimit);
            if (totalSpent <= newLimit) {
              setBudgetAlert(null);
            }
          }}
        />

        {/* Budget Limit Exceeded Alert Popup Banner */}
        <AnimatePresence>
          {budgetAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="w-full px-3 mt-3 z-30 relative"
            >
              <div className="bg-rose-950/90 dark:bg-rose-950/95 border-2 border-rose-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start gap-3 z-10">
                  <div className="p-2.5 bg-rose-500/30 rounded-xl border border-rose-400/40 text-rose-300 shrink-0 text-xl animate-bounce">
                    🚫
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-rose-200 tracking-wide uppercase flex items-center gap-2">
                      Budget Limit Reached
                    </h3>
                    <p className="text-xs text-rose-100 font-medium leading-relaxed mt-0.5">
                      {budgetAlert}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 z-10 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setBudgetLimit((prev) => prev + 5000);
                      setBudgetAlert(null);
                      sounds.playCashRegister();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 cursor-pointer transition-all border border-emerald-300/40"
                  >
                    + Add {currentCurr.symbol} 5,000 Budget
                  </button>
                  <button
                    onClick={() => setBudgetAlert(null)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 cursor-pointer transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Tab Views */}
        <main className="w-full transition-all duration-300 flex-1">
          {activeTab === "cart" && (
            <>
              <AddItemForm
                onAddItem={handleAddItem}
                onOpenScanner={() => setIsScannerOpen(true)}
                currency={currency}
              />
              <CartList
                items={items}
                currency={currency}
                budgetLimit={budgetLimit}
                onToggleCheck={handleToggleCheck}
                onUpdateQuantity={handleUpdateQuantity}
                onDeleteItem={handleDeleteItem}
                onClearChecked={handleClearChecked}
                onClearAll={handleClearAll}
                onCheckAll={handleCheckAll}
                onDuplicateItem={handleDuplicateItem}
              />
            </>
          )}

          {activeTab === "ai" && (
            <AIAssistantView
              cartItems={items}
              budgetLimit={budgetLimit}
              currency={currency}
              onAddItemsToCart={handleAddMultipleItems}
            />
          )}

          {activeTab === "barcode" && (
            <div className="w-full max-w-6xl mx-auto px-4 mt-4">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center text-fuchsia-400 text-3xl shadow-lg">
                  📷
                </div>
                <h2 className="text-base font-extrabold text-white tracking-wide">Point & Scan Barcodes</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Instantly scan real product barcodes using your camera or test our simulated barcode database for grocery items.
                </p>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-fuchsia-500/25 transition-all cursor-pointer border border-white/20"
                >
                  Open Camera & Barcode Scanner
                </button>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <BudgetAnalyticsView
              items={items}
              budgetLimit={budgetLimit}
              currency={currency}
            />
          )}

          {activeTab === "recipes" && (
            <RecipePlannerView
              onAddIngredients={handleAddMultipleItems}
              currency={currency}
            />
          )}

          {activeTab === "deals" && <DealsView currency={currency} />}
        </main>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScannedItem={(item) => {
          handleAddItem(item);
          setIsScannerOpen(false);
        }}
        currency={currency}
      />

      {/* App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        themeColor={themeColor}
        onThemeColorChange={setThemeColor}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        particlesEnabled={particlesEnabled}
        onToggleParticles={() => setParticlesEnabled(!particlesEnabled)}
        particleStyle={particleStyle}
        onParticleStyleChange={setParticleStyle}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        budgetLimit={budgetLimit}
        onUpdateBudget={setBudgetLimit}
        items={items}
      />
    </div>
  );
}
