
import { GoogleGenAI, Type } from "@google/genai";
import { PROXY_MODE_SIGNAL } from "../utils/crypto";

// Initialize Gemini AI dynamically
// Accepts an apiKey argument which can be either the user's personal key OR the PROXY_MODE_SIGNAL
export const findProductSynonyms = async (productName: string, apiKey: string): Promise<string[]> => {
  if (!apiKey) {
      throw new Error("Thiếu thông tin xác thực. Vui lòng cấu hình trong phần Cài đặt.");
  }

  // TRƯỜNG HỢP 1: DÙNG PASS NỘI BỘ -> GỌI QUA PROXY SERVER (BẢO MẬT)
  if (apiKey === PROXY_MODE_SIGNAL) {
      try {
          const response = await fetch('/api/gemini', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ productName })
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              if (response.status === 403) {
                  throw new Error("Key hệ thống có vấn đề. Vui lòng báo admin.");
              }
              throw new Error(errorData.error || "Lỗi khi gọi Server phân tích.");
          }

          const synonyms = await response.json();
          return Array.isArray(synonyms) ? synonyms : [];
      } catch (err: any) {
          console.error("Proxy API Error:", err);
          throw new Error(err.message || "Không thể kết nối tới máy chủ phân tích.");
      }
  }

  // TRƯỜNG HỢP 2: DÙNG KEY CÁ NHÂN (USER TỰ NHẬP) -> GỌI TRỰC TIẾP TỪ TRÌNH DUYỆT
  // (Trường hợp này User tự chịu trách nhiệm về Key của họ nên F12 thấy key của họ cũng không sao)
  
  if (!productName.trim()) return [];

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
    
    if (error.toString().includes("403") || (error.error && error.error.code === 403)) {
         throw new Error("API Key cá nhân không hợp lệ hoặc đã bị chặn.");
    }
    
    if (error.toString().includes("429")) {
        throw new Error("Hệ thống đang quá tải (Lỗi 429). Vui lòng thử lại sau.");
    }

    throw new Error("Lỗi kết nối AI.");
  }
};
