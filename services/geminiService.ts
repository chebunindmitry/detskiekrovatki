
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

export const enrichProductsWithDescriptions = async (products: Product[], contextInfo: string): Promise<Product[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Simplify product list for token efficiency
  const productList = products.map(p => ({ id: p.id, name: p.name, price: p.price, sku: p.sku }));
  
  const prompt = `
  Ты — заботливый и дружелюбный бот-консультант в Telegram для магазина детской мебели 'Детские Кроватки.рф'.
  Контекст запроса пользователя: "${contextInfo}".
  Вот список найденных товаров: ${JSON.stringify(productList)}.

  Твоя задача — для КАЖДОГО товара из списка написать короткое (15-25 слов), привлекательное и милое маркетинговое описание.
  Описание должно подчеркивать безопасность, комфорт и уют для малыша.
  Говори с пользователем на "вы", как заботливый консультант.
  
  Если товар кажется неподходящим к контексту, всё равно опиши его преимущества вежливо.

  Верни результат в виде JSON-массива. Каждый объект в массиве должен содержать "id" товара и "description" (сгенерированное описание).
  Не добавляй ничего лишнего в ответ, только валидный JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["id", "description"],
          },
        },
      },
    });

    const text = response.text.trim();
    const generatedDescriptions: { id: number; description: string }[] = JSON.parse(text);

    return products.map(product => {
      const generated = generatedDescriptions.find(d => d.id === product.id);
      return {
        ...product,
        description: generated ? generated.description : `Чудесный выбор для вашего малыша: ${product.name}.`,
      };
    });

  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Fallback in case of API error
    return products.map(p => ({...p, description: `Откройте для себя ${p.name} - идеальный выбор (Арт. ${p.sku}).`}));
  }
};
