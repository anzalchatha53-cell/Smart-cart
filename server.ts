import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy init Gemini AI
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Healthcheck endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Smart Cart AI API" });
});

// AI Chatbot with direct cart action support
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, cartItems, budget, currency, country, modelPersona } = req.body;
    const ai = getAI();

    const systemPrompt = `You are "Smart Cart AI" (Legend Edition), an intelligent, friendly, and expert shopping assistant for ${country || "Global"} markets.
Currency in use: ${currency || "PKR"}.
Current Cart Total Budget: ${budget || 5000} ${currency || "PKR"}.
Current Cart Content: ${JSON.stringify(cartItems || [])}.
Model Style/Persona requested: ${modelPersona || "Smart Open-Source AI (Mistral/Qwen/Gemini Hybrid)"}.

Your job is to:
1. Provide helpful, energetic, and practical advice on grocery shopping, meal prep, budget saving, deals, brand comparisons, and ingredient estimations.
2. If the user mentions items they want to buy, add, or make, ALWAYS include a JSON block in your response using the tag <CART_ITEMS>[{"name":"...", "price":123, "quantity":1, "category":"Produce|Dairy|Bakery|Meat|Snacks|Beverages|Household|Pantry|Other", "unit":"kg/liter/pack/pcs"}]</CART_ITEMS> so the app can render "Add to Cart" quick-buttons!
3. Keep your conversational response warm, engaging, with relevant emojis!`;

    // Construct conversation
    const promptText = `User says: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${promptText}` }],
        },
      ],
    });

    const reply = response.text || "I am here to help you optimize your cart and budget!";
    res.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to process AI chat request.",
      fallbackReply: "Sorry! I encountered an error connecting to the AI model. Try asking again or check your API key in Secrets.",
    });
  }
});

// Parse Voice / Raw Text into structured items
app.post("/api/parse-items", async (req, res) => {
  try {
    const { text, currency } = req.body;
    if (!text || !text.trim()) {
      res.json({ items: [] });
      return;
    }

    const ai = getAI();
    const prompt = `Extract shopping cart items from this user input text or voice transcription: "${text}".
Currency context: ${currency || "PKR"}.
For any item without explicit price, provide a reasonable real-world estimate in ${currency || "PKR"}.
Category choices: Produce, Dairy, Bakery, Meat, Snacks, Beverages, Household, Pantry, Other.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              quantity: { type: Type.NUMBER },
              category: { type: Type.STRING },
              unit: { type: Type.STRING },
            },
            required: ["name", "price", "quantity", "category"],
          },
        },
      },
    });

    let items = [];
    try {
      items = JSON.parse(response.text || "[]");
    } catch (e) {
      items = [];
    }

    res.json({ items });
  } catch (error: any) {
    console.error("Error in /api/parse-items:", error);
    res.status(500).json({ error: error.message || "Parse failed." });
  }
});

// Recipe to Cart items generator
app.post("/api/recipe-to-cart", async (req, res) => {
  try {
    const { recipeName, servings, currency } = req.body;
    const ai = getAI();

    const prompt = `Generate a complete list of required ingredients to cook "${recipeName}" for ${servings || 4} servings.
Provide realistic estimated prices in ${currency || "PKR"}.
Categories MUST be one of: Produce, Dairy, Bakery, Meat, Snacks, Beverages, Household, Pantry, Other.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeTitle: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            estimatedTotalCost: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                },
                required: ["name", "quantity", "unit", "price", "category"],
              },
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["recipeTitle", "ingredients", "estimatedTotalCost"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/recipe-to-cart:", error);
    res.status(500).json({ error: error.message || "Recipe generation failed." });
  }
});

// Smart price predictor / item autosuggestions
app.post("/api/suggest-price", async (req, res) => {
  try {
    const { query, currency, country } = req.body;
    const ai = getAI();

    const prompt = `Give a realistic average market price for the grocery item "${query}" in country "${country || "PK"}" using currency "${currency || "PKR"}". Also return category and common unit (kg, liter, pack, piece).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            price: { type: Type.NUMBER },
            category: { type: Type.STRING },
            unit: { type: Type.STRING },
          },
          required: ["itemName", "price", "category", "unit"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Smart Cart AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
