import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, Plus, Loader2, User, Zap, Brain, ShieldCheck } from "lucide-react";
import { ChatMessage, CartItem, CategoryType, CURRENCIES, CurrencyConfig } from "../types";
import { sounds } from "../utils/soundEffects";
import confetti from "canvas-confetti";

interface AIAssistantViewProps {
  cartItems: CartItem[];
  budgetLimit: number;
  currency: string;
  onAddItemsToCart: (
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      category: CategoryType;
      unit?: string;
    }>
  ) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  cartItems,
  budgetLimit,
  currency,
  onAddItemsToCart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Salam! 👋 I am your Smart Cart AI Assistant. Ask me anything about budget shopping, recipe ingredients, meal planning, or price estimations! I can also add suggested items directly to your cart.",
      timestamp: Date.now(),
      modelPersona: "Smart Open-Source AI (Mistral/Qwen/Gemini)",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>("Mistral-7B Open Shopper");

  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    `Suggest a delicious budget dinner under 1200 ${currency}`,
    "What ingredients do I need for Pancakes?",
    "How can I cut my grocery bill by 25%?",
    "Suggest healthy high-protein snacks",
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMsg("");
    setIsLoading(true);
    sounds.playClick();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          cartItems,
          budget: budgetLimit,
          currency,
          modelPersona: selectedPersona,
        }),
      });

      const data = await res.json();
      const replyRaw = data.reply || data.fallbackReply || "I am ready to help!";

      // Parse optional <CART_ITEMS> JSON from AI reply
      let suggestedItems: ChatMessage["suggestedItems"] = [];
      let cleanText = replyRaw;

      const cartTagMatch = replyRaw.match(/<CART_ITEMS>([\s\S]*?)<\/CART_ITEMS>/);
      if (cartTagMatch && cartTagMatch[1]) {
        try {
          suggestedItems = JSON.parse(cartTagMatch[1]);
          cleanText = replyRaw.replace(/<CART_ITEMS>[\s\S]*?<\/CART_ITEMS>/, "").trim();
        } catch (e) {
          // Ignore json parse error
        }
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: cleanText,
        timestamp: Date.now(),
        suggestedItems,
        modelPersona: selectedPersona,
      };

      setMessages((prev) => [...prev, aiMsg]);
      sounds.playAdd();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: "I am having trouble connecting to the AI backend. Make sure GEMINI_API_KEY is configured in Secrets, or try again!",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedItems = (itemsToAdd: NonNullable<ChatMessage["suggestedItems"]>) => {
    onAddItemsToCart(itemsToAdd);
    sounds.playCashRegister();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 mt-3 pb-24 flex flex-col h-[75vh]">
      {/* Persona Header Switcher */}
      <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-indigo-500/25 mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-extrabold text-slate-200">AI Model Persona:</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { name: "Mistral-7B Open Shopper", icon: Zap },
            { name: "Qwen-2.5 Budget Pro", icon: Brain },
            { name: "Gemini 3.6 Flash Expert", icon: Sparkles },
          ].map((p) => {
            const Icon = p.icon;
            const isSel = selectedPersona === p.name;
            return (
              <button
                key={p.name}
                onClick={() => {
                  setSelectedPersona(p.name);
                  sounds.playClick();
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{p.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 overflow-y-auto flex flex-col gap-3 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "align-self-end self-end" : "align-self-start self-start"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold px-1">
              {msg.sender === "user" ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-indigo-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span>{msg.modelPersona || "AI Shopper"}</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-lg ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-xs"
                  : "bg-slate-900 border border-indigo-500/30 text-slate-100 rounded-tl-xs shadow-indigo-500/5"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Suggested Cart Items Card */}
              {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                <div className="mt-3 p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl space-y-2">
                  <div className="text-[11px] font-extrabold text-indigo-300 flex items-center justify-between">
                    <span>💡 Recommended Cart Items ({msg.suggestedItems.length})</span>
                    <button
                      onClick={() => handleAddSuggestedItems(msg.suggestedItems!)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3 h-3" />
                      Add All ({currentCurr.symbol}{" "}
                      {msg.suggestedItems
                        .reduce((sum, item) => sum + item.price * item.quantity, 0)
                        .toLocaleString()}
                      )
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {msg.suggestedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[11px] bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-indigo-500/20"
                      >
                        <span className="font-bold text-slate-200">
                          {item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-indigo-300">
                          {currentCurr.symbol} {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="self-start flex items-center gap-2 bg-slate-900 border border-indigo-500/30 p-3 rounded-2xl text-xs font-semibold text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>AI is analyzing cart & market prices...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar my-2 py-1">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 hover:border-indigo-400 text-[11px] font-semibold text-slate-300 hover:text-indigo-300 transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask AI for grocery deals, recipes, budget tips..."
          className="flex-1 bg-slate-900/90 border border-indigo-500/30 text-slate-100 placeholder-slate-400 text-xs font-semibold rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMsg.trim() || isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
