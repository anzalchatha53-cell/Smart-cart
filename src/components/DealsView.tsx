import React, { useState } from "react";
import { Tag, Calculator, Sparkles, TrendingDown, ShieldCheck, Check } from "lucide-react";
import { CURRENCIES, CurrencyConfig } from "../types";
import { sounds } from "../utils/soundEffects";

interface DealsViewProps {
  currency: string;
}

export const DealsView: React.FC<DealsViewProps> = ({ currency }) => {
  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;

  // Unit Price Calculator state
  const [item1Price, setItem1Price] = useState("450");
  const [item1Qty, setItem1Qty] = useState("1000"); // 1000g

  const [item2Price, setItem2Price] = useState("200");
  const [item2Qty, setItem2Qty] = useState("400"); // 400g

  const p1 = parseFloat(item1Price) || 0;
  const q1 = parseFloat(item1Qty) || 1;
  const unitPrice1 = (p1 / q1) * 1000; // per 1000g/unit

  const p2 = parseFloat(item2Price) || 0;
  const q2 = parseFloat(item2Qty) || 1;
  const unitPrice2 = (p2 / q2) * 1000;

  const winner = unitPrice1 < unitPrice2 ? 1 : unitPrice2 < unitPrice1 ? 2 : 0;

  const DEALS_LIST = [
    {
      title: "Bulk Rice & Flour Bundle",
      discount: "Save 15%",
      desc: "Buying 5kg Basmati Rice + 10kg Atta together saves ~350 PKR vs 1kg single packs.",
      badge: "Best Value",
    },
    {
      title: "Breakfast Combo Special",
      discount: "Save 100 PKR",
      desc: "Milk 1L + Eggs 12-Pack + Whole Wheat Bread bundle.",
      badge: "Popular",
    },
    {
      title: "Weekly Grocery Staples",
      discount: "Save 12%",
      desc: "Buy oil in 3L bottles instead of 1L pouches to minimize packaging cost.",
      badge: "Smart Hack",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 mt-3 pb-24 space-y-4">
      {/* Unit Price Comparison Calculator */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/25 p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-extrabold text-slate-100">Smart Unit Price Saver Calculator</h2>
        </div>
        <p className="text-xs text-slate-400">
          Compare two different pack sizes to see which item gives you more value per unit!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Pack A */}
          <div
            className={`p-3 rounded-xl border ${
              winner === 1 ? "bg-emerald-950/40 border-emerald-500/50" : "bg-slate-950/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Option A (e.g. Large Pack)</span>
              {winner === 1 && (
                <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  🏆 Better Value!
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Price ({currentCurr.symbol})</label>
                <input
                  type="number"
                  value={item1Price}
                  onChange={(e) => setItem1Price(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Size (grams/ml)</label>
                <input
                  type="number"
                  value={item1Qty}
                  onChange={(e) => setItem1Qty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                />
              </div>
            </div>
            <div className="mt-2 text-xs font-extrabold text-indigo-300">
              Unit Rate: {currentCurr.symbol} {Math.round(unitPrice1)} / 1000g
            </div>
          </div>

          {/* Pack B */}
          <div
            className={`p-3 rounded-xl border ${
              winner === 2 ? "bg-emerald-950/40 border-emerald-500/50" : "bg-slate-950/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Option B (e.g. Small Pack)</span>
              {winner === 2 && (
                <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  🏆 Better Value!
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Price ({currentCurr.symbol})</label>
                <input
                  type="number"
                  value={item2Price}
                  onChange={(e) => setItem2Price(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Size (grams/ml)</label>
                <input
                  type="number"
                  value={item2Qty}
                  onChange={(e) => setItem2Qty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                />
              </div>
            </div>
            <div className="mt-2 text-xs font-extrabold text-indigo-300">
              Unit Rate: {currentCurr.symbol} {Math.round(unitPrice2)} / 1000g
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Deals & Coupons */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-300 flex items-center gap-1">
          <Tag className="w-4 h-4 text-purple-400" />
          <span>Curated Market Savings & Deals</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEALS_LIST.map((deal, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 p-4 rounded-2xl flex flex-col justify-between gap-2 shadow-lg hover:border-indigo-500/40 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full inline-block mb-1">
                  {deal.badge}
                </span>
                <h4 className="text-sm font-extrabold text-slate-100">{deal.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{deal.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">{deal.discount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
