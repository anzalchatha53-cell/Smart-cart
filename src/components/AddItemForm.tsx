import React, { useState, useEffect, useRef } from "react";
import { Plus, Mic, MicOff, QrCode, Sparkles, Loader2, History } from "lucide-react";
import { CURRENCIES, CurrencyConfig } from "../types";
import { SMART_SUGGESTION_DATABASE } from "../utils/sampleData";
import { getCustomSuggestions, addCustomSuggestion, CustomSuggestion } from "../utils/storage";
import { sounds } from "../utils/soundEffects";

interface AddItemFormProps {
  onAddItem: (item: {
    name: string;
    price: number;
    quantity: number;
  }) => boolean | void;
  onOpenScanner: () => void;
  currency: string;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({
  onAddItem,
  onOpenScanner,
  currency,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [suggestions, setSuggestions] = useState<CustomSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter smart suggestions (custom learned items + static daily life database)
  useEffect(() => {
    if (name.trim().length > 0) {
      const customItems = getCustomSuggestions();
      const combined: CustomSuggestion[] = [
        ...customItems,
        ...SMART_SUGGESTION_DATABASE.map((s) => ({
          name: s.name,
          price: s.price,
          isCustom: false,
        })),
      ];

      // Deduplicate by lowercased name
      const uniqueMap = new Map<string, CustomSuggestion>();
      combined.forEach((item) => {
        const key = item.name.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      const filtered = Array.from(uniqueMap.values()).filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 10));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [name]);

  // Apply suggestion
  const handleSelectSuggestion = (sug: CustomSuggestion) => {
    setName(sug.name);
    if (sug.price) setPrice(sug.price.toString());
    setShowSuggestions(false);
    sounds.playClick();
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(price) || 0;
    const parsedQty = parseFloat(quantity) || 1;
    const cleanName = name.trim();

    const success = onAddItem({
      name: cleanName,
      price: parsedPrice,
      quantity: parsedQty,
    });

    // If budget limit blocked addition, keep input values so user doesn't lose data
    if (success === false) {
      return;
    }

    // Save manually entered item into user's suggestion history!
    addCustomSuggestion({
      name: cleanName,
      price: parsedPrice,
    });

    setName("");
    setPrice("");
    setQuantity("1");
    setShowSuggestions(false);
    sounds.playAdd();
  };

  // Voice Input Handler
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const userVoiceText = prompt(
        "Voice input: Speak or type your item (e.g., 'Electricity Bill 12000' or 'Milk 320'):"
      );
      if (userVoiceText) {
        parseVoiceText(userVoiceText);
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        sounds.playClick();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        parseVoiceText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        sounds.playError();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Send voice text to server to parse structured item
  const parseVoiceText = async (text: string) => {
    setIsAiSuggesting(true);
    try {
      const res = await fetch("/api/parse-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, currency }),
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        setName(item.name || text);
        if (item.price) setPrice(item.price.toString());
        if (item.quantity) setQuantity(item.quantity.toString());
        sounds.playAdd();
      } else {
        setName(text);
      }
    } catch (err) {
      setName(text);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // Quick price predictor via AI
  const handleAutoPredictPrice = async () => {
    if (!name.trim()) return;
    setIsAiSuggesting(true);
    try {
      const res = await fetch("/api/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: name, currency }),
      });
      const data = await res.json();
      if (data.price) setPrice(data.price.toString());
      sounds.playAdd();
    } catch (e) {
      // Ignore
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="w-full px-3 sm:px-4 mt-3 relative z-30">
      <div className="bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-xl relative transition-all duration-300">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Top Row: Name + AI Predict & Voice & Scanner */}
          <div className="relative z-40">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                placeholder="Item name (e.g. Milk 1L, Eggs, Book, Copy)..."
                className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 focus:border-fuchsia-500/50 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-fuchsia-500/30 transition-all"
              />

              {/* AI Auto Estimate price button */}
              {name.trim().length > 2 && (
                <button
                  type="button"
                  onClick={handleAutoPredictPrice}
                  disabled={isAiSuggesting}
                  title="Estimate price with AI"
                  className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/40 text-[11px] font-bold px-2.5 py-2.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {isAiSuggesting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-fuchsia-300" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                  )}
                  <span className="hidden xs:inline">AI Price</span>
                </button>
              )}

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title="Speak item name or bill"
                className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white border-rose-400 animate-bounce"
                    : "bg-white/5 text-slate-300 border-white/10 hover:text-fuchsia-300 hover:border-white/20"
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-fuchsia-400" />}
              </button>

              {/* Barcode Scanner Button */}
              <button
                type="button"
                onClick={() => {
                  onOpenScanner();
                  sounds.playClick();
                }}
                title="Scan barcode"
                className="p-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:text-indigo-300 hover:border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* Smart Suggestions Dropdown (Static Database + Saved User Items) */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-300 dark:border-white/20 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-[100] divide-y divide-slate-200 dark:divide-white/10 backdrop-blur-2xl">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="px-3 py-2.5 hover:bg-fuchsia-500/15 dark:hover:bg-fuchsia-500/20 cursor-pointer flex items-center justify-between transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {sug.isCustom ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <History className="w-2.5 h-2.5 text-amber-500" /> Custom
                        </span>
                      ) : (
                        <span className="text-slate-400">✨</span>
                      )}
                      <span className="font-bold text-slate-100 dark:text-slate-100">{sug.name}</span>
                    </div>
                    {sug.price > 0 && (
                      <div className="text-[11px] font-extrabold text-fuchsia-400 dark:text-fuchsia-300">
                        {currentCurr.symbol} {sug.price}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Row: Price, Quantity, Submit */}
          <div className="grid grid-cols-5 gap-2">
            {/* Price Input */}
            <div className="col-span-2">
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={`Price (${currentCurr.symbol})`}
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 focus:border-fuchsia-500/50 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-500/30"
              />
            </div>

            {/* Quantity Input */}
            <div className="col-span-1">
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Qty"
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 focus:border-fuchsia-500/50 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-bold rounded-xl px-2 py-2 outline-none text-center"
              />
            </div>

            {/* Submit Button */}
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-widest py-2 px-3 rounded-xl shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>ADD</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


