
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI dynamically
// Accepts an apiKey argument which can be either the user's personal key or the system key
export const findProductSynonyms = async (productName: string, apiKey: string): Promise<string[]> => {
  if (!apiKey) {
      throw new Error("Thiếu API Key. Vui lòng cấu hình trong phần Cài đặt.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  if (!productName.trim()) return [];

  const prompt = `
    Bạn là một chuyên gia về dược phẩm và thiết bị y tế trong đấu thầu tại Việt Nam.
    Nhiệm vụ: Liệt kê các tên gọi khác, cách viết khác, tên thương mại phổ biến, hoặc tên kỹ thuật tương đương của sản phẩm: "${productName}".
    
    Yêu cầu logic suy luận:
    1. Tìm các biến thể về chính tả (ví dụ: Sulfat vs Sulphate, Acid vs Axit).
    2. Tìm các tên gọi chức năng (ví dụ: Test Glucose vs Que thử đường huyết).
    3. Tìm các tên kèm quy cách phổ biến hoặc tên tiếng Anh thường dùng trong hồ sơ thầu.
    4. Chỉ liệt kê các sản phẩm CÙNG LOẠI, cùng công dụng, không liệt kê sản phẩm khác.
    
    Trả về kết quả dưới dạng JSON Array chứa danh sách các chuỗi tên (String). Không giải thích gì thêm.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const synonyms = JSON.parse(jsonText);
    return Array.isArray(synonyms) ? synonyms : [];
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    // Xử lý các mã lỗi cụ thể để báo cho người dùng dễ hiểu
    if (error.toString().includes("403") || (error.error && error.error.code === 403)) {
         throw new Error("API Key không hợp lệ hoặc đã bị chặn. Vui lòng kiểm tra lại Key của bạn.");
    }
    
    if (error.toString().includes("429")) {
        throw new Error("Hệ thống đang quá tải (Lỗi 429). Vui lòng thử lại sau vài phút.");
    }

    throw new Error("Lỗi kết nối AI. Vui lòng kiểm tra lại Internet hoặc thử lại sau.");
  }
};
