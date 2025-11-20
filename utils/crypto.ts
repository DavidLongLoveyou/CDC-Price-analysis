
// Kỹ thuật Obfuscation:
// 1. Key gốc được đảo ngược (Reverse).
// 2. Chuyển sang Base64.
// 3. Cắt nhỏ chuỗi Base64 thành các mảnh rời rạc để tránh việc tìm kiếm chuỗi (String Search) trong F12.

// Password target: "mpi.huy" -> Base64: "bXBpLmh1eQ=="
const _p = ["bXBp", "Lmh1", "eQ=="]; 

// Key target: "AIzaSyDFjKEc84oFSf25qUZvWdLUsquMjX4jgH4"
// Reversed: "4Hgj4XjMuqUsLdWvZq52fSo48cEKjFDySazIA"
// Base64 of Reversed: "NEhNajRYak11cVVzTGRXdlpxNTJmU280OGNFS2pGRHlTYXpJA=="

// Chúng ta chia nhỏ chuỗi Base64 trên thành các biến vô nghĩa
const _k1 = "NEhNajRYak11";
const _k2 = "cVVzTGRXdlpx";
const _k3 = "NTJmU280OGNF";
const _k4 = "S2pGRHlTYXpJA==";

export const verifyAccess = (inputPass: string): string | null => {
    if (!inputPass) return null;

    // Reconstruct password hash to check
    const check = btoa(inputPass);
    const target = _p.join('');

    if (check === target) {
        // Nếu pass đúng (mpi.huy), tiến hành giải mã key
        try {
            // 1. Gép chuỗi Base64
            const b64 = _k1 + _k2 + _k3 + _k4;
            
            // 2. Decode Base64
            const reversed = atob(b64);
            
            // 3. Đảo ngược lại chuỗi để ra Key gốc
            return reversed.split('').reverse().join('');
        } catch (e) {
            console.error("Decryption failed");
            return null;
        }
    }
    return null;
};
