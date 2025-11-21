
// Mật khẩu hash target (mpi.huy)
// Base64 của "mpi.huy" là "bXBpLmh1eQ=="
const _h = "bXBpLmh1eQ==";

// Constant để báo hiệu cho Service biết là dùng Proxy Server
export const PROXY_MODE_SIGNAL = "USE_SERVER_PROXY";

export const verifyAccess = (inputPass: string): string | null => {
    if (!inputPass) return null;
    
    // Quan trọng: Xóa khoảng trắng thừa khi user copy paste
    const cleanPass = inputPass.trim();

    // Encode pass nhập vào sang base64 để so sánh
    try {
        const check = btoa(cleanPass);
        
        if (check === _h) {
            // Nếu pass đúng, ta trả về tín hiệu đặc biệt.
            // Frontend KHÔNG CẦN BIẾT Key là gì.
            // Frontend sẽ dùng tín hiệu này để gọi vào api/gemini.js
            return PROXY_MODE_SIGNAL;
        }
    } catch (e) {
        return null;
    }
    
    return null;
};
