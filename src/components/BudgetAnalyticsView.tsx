import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { PieChart as PieIcon, Download, TrendingUp, FileSpreadsheet } from "lucide-react";
import { CartItem, CURRENCIES, CurrencyConfig } from "../types";
import { sounds } from "../utils/soundEffects";
import { exportCartToCSV } from "../utils/csvExport";

interface BudgetAnalyticsViewProps {
  items: CartItem[];
  budgetLimit: number;
  currency: string;
}

const COLORS = [
  "#d946ef", // fuchsia
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#f97316", // orange
];

export const BudgetAnalyticsView: React.FC<BudgetAnalyticsViewProps> = ({
  items,
  budgetLimit,
  currency,
}) => {
  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;

  // Prepare top item cost data for chart
  const itemData = items
    .map((item) => ({
      name: item.name.length > 18 ? item.name.substring(0, 15) + "..." : item.name,
      fullName: item.name,
      value: item.price * item.quantity,
      qty: item.quantity,
      unit: item.unit,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 items

  const totalSpent = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const highestItem = items.reduce(
    (max, i) => (i.price * i.quantity > (max ? max.price * max.quantity : 0) ? i : max),
    items[0]
  );

  // Export JSON
  const handleExportJSON = () => {
    sounds.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smart-household-expenses-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 mt-4 pb-24 space-y-4">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Household Spent
          </span>
          <span className="text-base sm:text-lg font-extrabold text-fuchsia-400 mt-1 block">
            {currentCurr.symbol} {totalSpent.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">{items.length} items logged</span>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Budget Capacity
          </span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-400 mt-1 block">
            {Math.round((totalSpent / (budgetLimit || 1)) * 100)}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {currentCurr.symbol} {(budgetLimit - totalSpent).toLocaleString()} remaining
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Highest Expense Item
          </span>
          {highestItem ? (
            <>
              <span className="text-xs sm:text-sm font-extrabold text-rose-400 mt-1 block truncate">
                {highestItem.name}
              </span>
              <span className="text-[10px] text-slate-300 font-bold block">
                {currentCurr.symbol} {(highestItem.price * highestItem.quantity).toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-500 mt-1 block">No expenses in list</span>
          )}
        </div>
      </div>

      {/* Expense Distribution Chart */}
      {itemData.length > 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-fuchsia-400" />
              <span>Top Household Expenses</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#d946ef",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${currentCurr.symbol} ${val.toLocaleString()}`, "Expense"]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {itemData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center text-xs text-slate-400">
          Add items to your list to see live visual expense analytics!
        </div>
      )}

      {/* Expense List Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-extrabold text-slate-200">Itemized Cost Ranking</h3>

        <div className="space-y-2">
          {items
            .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
            .map((item, idx) => {
              const itemTotal = item.price * item.quantity;
              const pct = Math.round((itemTotal / (totalSpent || 1)) * 100);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-black/40 rounded-xl border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-[10px] font-black text-slate-500 w-5">#{idx + 1}</span>
                    <span className="font-bold text-slate-200 truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      (x{item.quantity})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden hidden xs:block">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="font-extrabold text-fuchsia-300">
                      {currentCurr.symbol} {itemTotal.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Export / Backup Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div>
          <h4 className="text-xs font-bold text-slate-200">Export & Backup Household Expenses</h4>
          <p className="text-[10px] text-slate-400">Save list as CSV spreadsheet (Excel) or backup JSON file</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCartToCSV(items, budgetLimit, currency)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

