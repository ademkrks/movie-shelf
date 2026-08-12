// Kullanıcı kayıt validation'ı
const registerValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { name, email, password } = body;

    // İsim kontrolü
    if (!name || typeof name !== "string") {
        return "Ad alanı zorunludur.";
    }

    if (name.trim().length === 0) {
        return "Ad alanı boş bırakılamaz.";
    }

    // E-posta kontrolü
    if (!email || typeof email !== "string") {
        return "E-posta alanı zorunludur.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return "Geçerli bir e-posta adresi giriniz.";
    }

    // Şifre kontrolü
    if (!password || typeof password !== "string") {
        return "Şifre alanı zorunludur.";
    }

    if (password.length < 8) {
        return "Şifre en az 8 karakter olmalıdır.";
    }

    return true;
};


// Kullanıcı giriş validation'ı
const loginValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { email, password } = body;

    // E-posta kontrolü
    if (!email || typeof email !== "string") {
        return "E-posta alanı zorunludur.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return "Geçerli bir e-posta adresi giriniz.";
    }

    // Şifre kontrolü
    if (!password || typeof password !== "string") {
        return "Şifre alanı zorunludur.";
    }

    return true;
};


module.exports = {
    registerValidation,
    loginValidation,
};