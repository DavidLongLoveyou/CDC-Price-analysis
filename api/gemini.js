
// Vercel Serverless Function
// File này chạy trên Server (Backend), người dùng không thể xem code hay F12 file này.
// Nhiệm vụ: Nhận yêu cầu từ Frontend -> Lấy Key bí mật -> Gọi Google -> Trả kết quả.

export default async function handler(req, res) {
  // Cho phép gọi từ trang web của bạn
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productName } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Thiếu tên sản phẩm' });
    }

    // Lấy API Key từ môi trường Server (Bảo mật tuyệt đối)
    // Vercel tự động cung cấp biến môi trường process.env
    const apiKey = process.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server chưa cấu hình API Key' });
    }

    // Gọi Google Gemini qua REST API (Để không phụ thuộc thư viện trên Serverless function đơn giản)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Error:", errorText);
      
      if (response.status === 403) {
         return res.status(403).json({ error: 'API Key hệ thống bị lỗi hoặc hết hạn.' });
      }
      return res.status(response.status).json({ error: 'Lỗi từ phía Google AI' });
    }

    const data = await response.json();
    
    // Trích xuất text từ response phức tạp của Google
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
        return res.status(200).json([]); // Trả về mảng rỗng nếu không có kết quả
    }

    // Trả về JSON array cho Frontend
    // Vì generatedText là chuỗi JSON "['a', 'b']", ta parse nó ra object rồi gửi về
    try {
        const synonyms = JSON.parse(generatedText);
        res.status(200).json(synonyms);
    } catch (parseError) {
        res.status(200).json([]); 
    }

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Lỗi xử lý phía Server' });
  }
}
