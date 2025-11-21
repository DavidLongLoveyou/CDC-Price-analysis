
// Mật khẩu hash target (mpi.huy)
// Base64 của "mpi.huy" là "bXBpLmh1eQ=="
const _h = "bXBpLmh1eQ==";

export const verifyAccess = (inputPass: string): string | null => {
    if (!inputPass) return null;
    
    // Quan trọng: Xóa khoảng trắng thừa khi user copy paste
    const cleanPass = inputPass.trim();

    // Encode pass nhập vào sang base64 để so sánh
    try {
        const check = btoa(cleanPass);
        
        if (check === _h) {
            // Khi deploy lên Vercel với Vite, biến môi trường nằm trong import.meta.env
            // và BẮT BUỘC phải có prefix VITE_ (như bạn đã cấu hình: VITE_GOOGLE_API_KEY)
            
            // @ts-ignore
            const viteKey = import.meta.env.VITE_GOOGLE_API_KEY;
            
            // Ưu tiên lấy key từ Vite Env
            if (viteKey) {
                return viteKey;
            }

            // Fallback an toàn cho các môi trường khác (nếu có)
            if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
                return process.env.API_KEY;
            }
            
            return null;
        }
    } catch (e) {
        return null;
    }
    
    return null;
};
