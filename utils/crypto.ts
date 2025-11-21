
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
            // Nếu Hash khớp với "mpi.huy"
            // Trả về API Key từ biến môi trường hệ thống (Environment Variable)
            // Điều này đảm bảo Key không bao giờ bị lộ trong mã nguồn (Source Code)
            return process.env.API_KEY || null;
        }
    } catch (e) {
        return null;
    }
    
    return null;
};
