// Kullanıcı profil güncelleme validation'ı
const updateProfileValidation = (body) => {
    // Request body kontrolü
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const { name, email } = body;

    // En az bir alan gönderilmeli
    if (
        (name === undefined || name === null) &&
        (email === undefined || email === null)
    ) {
        return "Güncellenecek en az bir alan gönderilmelidir.";
    }

    // İsim kontrolü
    if (name !== undefined) {
        if (typeof name !== "string") {
            return "Ad alanı metin olmalıdır.";
        }

        if (name.trim().length === 0) {
            return "Ad alanı boş bırakılamaz.";
        }

        if (name.trim().length > 100) {
            return "Ad alanı en fazla 100 karakter olabilir.";
        }
    }

    // E-posta kontrolü
    if (email !== undefined) {
        if (typeof email !== "string") {
            return "E-posta alanı metin olmalıdır.";
        }

        const trimmedEmail = email.trim();

        if (trimmedEmail.length === 0) {
            return "E-posta alanı boş bırakılamaz.";
        }

        if (trimmedEmail.length > 255) {
            return "E-posta alanı en fazla 255 karakter olabilir.";
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            return "Geçerli bir e-posta adresi giriniz.";
        }
    }

    return true;
};


// Şifre değiştirme validation'ı
const changePasswordValidation = (body) => {
    // Request body kontrolü
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const {
        currentPassword,
        newPassword,
    } = body;

    // Mevcut şifre zorunludur
    if (
        currentPassword === undefined ||
        currentPassword === null
    ) {
        return "Mevcut şifre alanı zorunludur.";
    }

    if (typeof currentPassword !== "string") {
        return "Mevcut şifre metin olmalıdır.";
    }

    if (currentPassword.length === 0) {
        return "Mevcut şifre boş bırakılamaz.";
    }

    // Yeni şifre zorunludur
    if (
        newPassword === undefined ||
        newPassword === null
    ) {
        return "Yeni şifre alanı zorunludur.";
    }

    if (typeof newPassword !== "string") {
        return "Yeni şifre metin olmalıdır.";
    }

    if (newPassword.length < 8) {
        return "Yeni şifre en az 8 karakter olmalıdır.";
    }

    return true;
};


module.exports = {
    updateProfileValidation,
    changePasswordValidation,
};