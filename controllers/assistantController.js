const { GoogleGenAI } = require("@google/genai");

const generateAssistantResponse = async ({
  question,
  products = [],
  farmers = [],
  markets = [],
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const context = `
You are the MarketLink AI Assistant.

MarketLink is a farmers marketplace where customers can find
products, farmers and markets.

Help customers with:
- Finding specific products
- Finding farmers
- Market timings
- Farmer availability
- Pickup windows
- Product details and prices

IMPORTANT RULES:
- Answer ONLY using the MarketLink data provided.
- Never invent products, farmers, markets, prices or timings.
- If information is unavailable, say:
  "I couldn't find that information in MarketLink."
- Keep answers short, friendly and useful.

MARKETS:
${JSON.stringify(markets, null, 2)}

FARMERS:
${JSON.stringify(farmers, null, 2)}

PRODUCTS:
${JSON.stringify(products, null, 2)}

CUSTOMER QUESTION:
${question}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash", // Updated model identifier
    contents: context,
  });

  return response.text;
};

module.exports = {
  generateAssistantResponse,
};