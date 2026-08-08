import React, { useState } from "react";
import { motion } from "motion/react";
import { DollarSign, AlertTriangle, CheckCircle2, TrendingUp, Edit2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "../utils/soundEffects";
import { CURRENCIES, CurrencyConfig } from "../types";

interface BudgetBannerProps {
  budgetLimit: number;
  totalSpent: number;
  currency: string;
  onUpdateBudget: (newLimit: number) => void;
}

export const BudgetBanner: React.FC<BudgetBannerProps> = ({
  budgetLimit,
  totalSpent,
  currency,
  onUpdateBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(budgetLimit.toString());

  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;
  const percentage = Math.min(Math.round((totalSpent / (budgetLimit || 1)) * 100), 200);
  const remaining = budgetLimit - totalSpent;

  const handleSaveBudget = () => {
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateBudget(parsed);
      setIsEditing(false);
      sounds.playCashRegister();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });
    }
  };

  // Status calculation
  let statusText = "Optimal";
  let statusEmoji = "⚡";
  let barGradient = "from-indigo-500 via-purple-500 to-fuchsia-500";
  let statusBadgeColor = "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30";

  if (percentage >= 100) {
    statusText = "Exceeded!";
    statusEmoji = "🚨";
    barGradient = "from-rose-500 via-pink-600 to-red-600";
    statusBadgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
  } else if (percentage >= 80) {
    statusText = "Warning!";
    statusEmoji = "⚠️";
    barGradient = "from-amber-500 via-orange-500 to-rose-500";
    statusBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  }

  return (
    <div className="w-full px-3 mt-3">
      <div className="relative overflow-hidden border backdrop-blur-md rounded-2xl p-3.5 shadow-xl transition-all duration-300 bg-white/10 dark:bg-white/5 border-slate-200 dark:border-white/10">
        {/* Background Radial Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-3 relative z-10">
          {/* Top Line: Title & Edit Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{statusEmoji}</span>
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  Budget Protocol
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeColor}`}>
                  {statusText} ({percentage}% Spent)
                </span>
              </div>
            </div>

            {/* Edit Budget Control */}
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-28 bg-slate-100 dark:bg-black/60 text-slate-900 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-white/20 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  placeholder="Limit"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveBudget}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Save
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(true);
                  setInputVal(budgetLimit.toString());
                  sounds.playClick();
                }}
                className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-white/5 hover:bg-indigo-100 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-white/10 transition-all cursor-pointer font-bold shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5 text-fuchsia-500 dark:text-fuchsia-400" />
                <span>Adjust Limit</span>
              </motion.button>
            )}
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-2">
            <div className="w-full h-3.5 bg-slate-200 dark:bg-black/50 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/10 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${barGradient} shadow-[0_0_12px_rgba(217,70,239,0.5)]`}
              />
            </div>

            {/* Spent vs Remaining Info */}
            <div className="flex items-center justify-between text-xs font-bold pt-0.5">
              <span className="text-slate-700 dark:text-slate-300">
                Total Spent:{" "}
                <span className="text-indigo-600 dark:text-indigo-300 font-extrabold text-sm">
                  {currentCurr.symbol} {totalSpent.toLocaleString()}
                </span>
              </span>

              <span className="text-slate-600 dark:text-slate-400">
                {remaining >= 0 ? (
                  <>
                    Remaining:{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                      {currentCurr.symbol} {remaining.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    Over budget:{" "}
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                      {currentCurr.symbol} {Math.abs(remaining).toLocaleString()}
                    </span>
                  </>
                )}
              </span>

              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                Target: {currentCurr.symbol} {budgetLimit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};
