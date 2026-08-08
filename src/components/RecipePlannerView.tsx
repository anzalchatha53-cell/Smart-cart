import React, { useState } from "react";
import { Utensils, Plus, Sparkles, Loader2, Clock, CheckCircle2, Search } from "lucide-react";
import { CategoryType, CURRENCIES, CurrencyConfig } from "../types";
import { sounds } from "../utils/soundEffects";
import confetti from "canvas-confetti";

interface RecipePlannerViewProps {
  onAddIngredients: (
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      category: CategoryType;
      unit?: string;
    }>
  ) => void;
  currency: string;
}

const PRESET_RECIPES = [
  {
    id: "rec-1",
    title: "Chicken Biryani (Serves 4)",
    prepTime: "45 mins",
    estimatedCost: 1450,
    emoji: "🍛",
    ingredients: [
      { name: "Super Basmati Rice", price: 380, quantity: 1, unit: "kg", category: "Pantry" as CategoryType },
      { name: "Fresh Chicken Pieces", price: 750, quantity: 1, unit: "kg", category: "Meat" as CategoryType },
      { name: "Shan Biryani Masala", price: 140, quantity: 1, unit: "pack", category: "Pantry" as CategoryType },
      { name: "Plain Yogurt Dahi", price: 90, quantity: 1, unit: "pack", category: "Dairy" as CategoryType },
      { name: "Fresh Tomatoes & Onions", price: 90, quantity: 1, unit: "pack", category: "Produce" as CategoryType },
    ],
  },
  {
    id: "rec-2",
    title: "Fluffy Breakfast Pancakes",
    prepTime: "20 mins",
    estimatedCost: 680,
    emoji: "🥞",
    ingredients: [
      { name: "All-Purpose Flour Maida", price: 160, quantity: 1, unit: "pack", category: "Pantry" as CategoryType },
      { name: "Full Cream Milk 1L", price: 320, quantity: 1, unit: "liter", category: "Dairy" as CategoryType },
      { name: "Farm Fresh Eggs 6-Pack", price: 200, quantity: 1, unit: "pack", category: "Dairy" as CategoryType },
    ],
  },
  {
    id: "rec-3",
    title: "Creamy Alfredo Pasta",
    prepTime: "25 mins",
    estimatedCost: 1120,
    emoji: "🍝",
    ingredients: [
      { name: "Penne Pasta 500g", price: 280, quantity: 1, unit: "pack", category: "Pantry" as CategoryType },
      { name: "Heavy Cooking Cream 200ml", price: 190, quantity: 1, unit: "pack", category: "Dairy" as CategoryType },
      { name: "Chicken Breast Boneless", price: 650, quantity: 0.5, unit: "kg", category: "Meat" as CategoryType },
    ],
  },
  {
    id: "rec-4",
    title: "Crispy Beef Tacos",
    prepTime: "30 mins",
    estimatedCost: 1350,
    emoji: "🌮",
    ingredients: [
      { name: "Mince Beef 500g", price: 800, quantity: 1, unit: "pack", category: "Meat" as CategoryType },
      { name: "Taco Shells 12-Pack", price: 420, quantity: 1, unit: "pack", category: "Pantry" as CategoryType },
      { name: "Cheddar Cheese Shredded", price: 130, quantity: 1, unit: "pack", category: "Dairy" as CategoryType },
    ],
  },
];

export const RecipePlannerView: React.FC<RecipePlannerViewProps> = ({
  onAddIngredients,
  currency,
}) => {
  const [customRecipeQuery, setCustomRecipeQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecipeResult, setAiRecipeResult] = useState<any>(null);

  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;

  const handleAddRecipeToCart = (ingredients: any[]) => {
    onAddIngredients(ingredients);
    sounds.playCashRegister();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
    });
  };

  const handleSearchAiRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRecipeQuery.trim() || isLoading) return;

    setIsLoading(true);
    setAiRecipeResult(null);
    sounds.playClick();

    try {
      const res = await fetch("/api/recipe-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: customRecipeQuery,
          servings: 4,
          currency,
        }),
      });

      const data = await res.json();
      if (data.ingredients) {
        setAiRecipeResult(data);
        sounds.playAdd();
      }
    } catch (err) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 mt-3 pb-24 space-y-4">
      {/* Search Recipe Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/25 p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-extrabold text-slate-100">AI Meal & Recipe Ingredient Extractor</h2>
        </div>

        <form onSubmit={handleSearchAiRecipe} className="flex gap-2">
          <input
            type="text"
            value={customRecipeQuery}
            onChange={(e) => setCustomRecipeQuery(e.target.value)}
            placeholder="Type any dish (e.g., Aloo Palak, Chocolate Chip Cookies, Butter Chicken)..."
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-300" />
            )}
            <span>Extract</span>
          </button>
        </form>

        {/* AI Result Card */}
        {aiRecipeResult && (
          <div className="mt-3 p-3.5 bg-indigo-950/60 border border-indigo-500/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{aiRecipeResult.recipeTitle}</h3>
                <span className="text-[10px] text-indigo-300">
                  Prep Time: {aiRecipeResult.prepTime || "25 mins"} • Est. Total: {currentCurr.symbol}{" "}
                  {aiRecipeResult.estimatedTotalCost?.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleAddRecipeToCart(aiRecipeResult.ingredients)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add All ({aiRecipeResult.ingredients?.length})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiRecipeResult.ingredients?.map((ing: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-indigo-500/20 text-xs"
                >
                  <span className="font-semibold text-slate-200">
                    {ing.name} ({ing.quantity} {ing.unit})
                  </span>
                  <span className="font-bold text-indigo-300">
                    {currentCurr.symbol} {ing.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular Recipes Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-300">Popular Quick Meal Recipes</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_RECIPES.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-lg hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{recipe.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {recipe.prepTime}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-100">{recipe.title}</h4>

                <div className="mt-2 space-y-1">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>• {ing.name}</span>
                      <span className="font-semibold text-indigo-300">
                        {currentCurr.symbol} {ing.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">
                  Est. Total: {currentCurr.symbol} {recipe.estimatedCost}
                </span>

                <button
                  onClick={() => handleAddRecipeToCart(recipe.ingredients)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Ingredients</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
