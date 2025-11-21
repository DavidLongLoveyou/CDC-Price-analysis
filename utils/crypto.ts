
// Constant để báo hiệu cho Service biết là dùng Proxy Server
// Khi trả về giá trị này, App sẽ gọi api/gemini.js thay vì gọi trực tiếp Google
export const PROXY_MODE_SIGNAL = "USE_SERVER_PROXY";

// Hàm Rot13 đơn giản để làm rối mã (Obfuscation)
// Biến đổi ký tự: a->n, b->o, ...
const rot13 = (str: string) => {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + (c.charCodeAt(0) - base + 13) % 26);
  });
};

// Target Hash của "mpi.huy" sau khi qua Rot13 và Base64
// Quy trình mã hóa: "mpi.huy" -> (Rot13) -> "zcv.uhl" -> (Base64) -> "emN2LnVobA=="
// Việc này giúp che giấu mật khẩu gốc khỏi việc bị dịch ngược đơn giản qua F12.
const _target = "emN2LnVobA==";

export const verifyAccess = (inputPass: string): string | null => {
    if (!inputPass) return null;
    
    // Xóa khoảng trắng thừa
    const cleanPass = inputPass.trim();

    try {
        // Bước 1: Rot13 (Đảo chữ để che giấu nội dung)
        const rotated = rot13(cleanPass);
        // Bước 2: Base64 encode
        const encoded = btoa(rotated);
        
        // So sánh với chuỗi mục tiêu đã mã hóa
        if (encoded === _target) {
            // Pass đúng -> Trả về tín hiệu Proxy
            // TUYỆT ĐỐI KHÔNG trả về API Key hay truy cập import.meta.env ở đây
            // để đảm bảo Key không bao giờ lọt vào client bundle.
            return PROXY_MODE_SIGNAL;
        }
    } catch (e) {
        return null;
    }
    
    return null;
};
