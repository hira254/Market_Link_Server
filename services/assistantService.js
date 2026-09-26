const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAssistantResponse = async ({
  question,
  products = [],
  farmers = [],
  markets = [],
}) => {
  const context = `
You are the MarketLink AI Assistant.

MarketLink is a farmers marketplace where customers can find
farmers, products and markets.

IMPORTANT RULES:
- Answer only using the MarketLink data provided below.
- Do not invent products, farmers, markets, prices or timings.
- If the requested information is not available, clearly say
  that you could not find it.
- Keep answers short, friendly and useful.
- Help customers find products across markets and farmers.

MARKET DATA:
${JSON.stringify(markets, null, 2)}

FARMER DATA:
${JSON.stringify(farmers, null, 2)}

PRODUCT DATA:
${JSON.stringify(products, null, 2)}

CUSTOMER QUESTION:
${question}
`;

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: context,
  });

  return response.output_text;
};

module.exports = {
  generateAssistantResponse,
};