
// Kỹ thuật Obfuscation: Shuffled Array
// Chúng ta cắt Key gốc thành 5 mảnh và lưu trữ lộn xộn trong mảng.
// Khi pass đúng, chúng ta sẽ ghép lại theo đúng thứ tự index.

// Key gốc: "AIzaSyDFjKEc84oFSf25qUZvWdLUsquMjX4jgH4"
// Các mảnh:
// 1. AIzaSyDF
// 2. jKEc84oF
// 3. Sf25qUZv
// 4. WdLUsquM
// 5. jX4jgH4

// Lưu trữ lộn xộn để tránh việc đọc trực tiếp từ file
const _s = [
    "Sf25qUZv", // Index 0 (Mảnh 3)
    "jKEc84oF", // Index 1 (Mảnh 2)
    "AIzaSyDF", // Index 2 (Mảnh 1 - Đầu tiên)
    "jX4jgH4",  // Index 3 (Mảnh 5 - Cuối cùng)
    "WdLUsquM"  // Index 4 (Mảnh 4)
];

// Password hash target (mpi.huy)
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
            // Nếu Hash khớp, tiến hành ghép Key
            // Thứ tự đúng: Mảnh 1 (Index 2) + Mảnh 2 (Index 1) + Mảnh 3 (Index 0) + Mảnh 4 (Index 4) + Mảnh 5 (Index 3)
            return _s[2] + _s[1] + _s[0] + _s[4] + _s[3];
        }
    } catch (e) {
        return null;
    }
    
    return null;
};
