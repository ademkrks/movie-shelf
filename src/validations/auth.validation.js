const {
    BCRYPT_MAX_PASSWORD_BYTES,
    isPasswordWithinBcryptLimit,
} = require(
    "../utils/password"
);


// Kullanıcı kayıt validation'ı
const registerValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const {
        name,
        email,
        password,
    } = body;

    // İsim kontrolü
    if (
        !name ||
        typeof name !== "string"
    ) {
        return "Ad alanı zorunludur.";
    }

    if (
        name.trim().length === 0
    ) {
        return "Ad alanı boş bırakılamaz.";
    }

    if (
        name.trim().length > 100
    ) {
        return "Ad alanı en fazla 100 karakter olabilir.";
    }

    // E-posta kontrolü
    if (
        !email ||
        typeof email !== "string"
    ) {
        return "E-posta alanı zorunludur.";
    }

    const trimmedEmail =
        email.trim();

    if (
        trimmedEmail.length > 255
    ) {
        return "E-posta alanı en fazla 255 karakter olabilir.";
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailRegex.test(
            trimmedEmail
        )
    ) {
        return "Geçerli bir e-posta adresi giriniz.";
    }

    // Şifre kontrolü
    if (
        !password ||
        typeof password !== "string"
    ) {
        return "Şifre alanı zorunludur.";
    }

    if (
        password.length < 8
    ) {
        return "Şifre en az 8 karakter olmalıdır.";
    }

    if (
        !isPasswordWithinBcryptLimit(
            password
        )
    ) {
        return `Şifre UTF-8 olarak en fazla ${BCRYPT_MAX_PASSWORD_BYTES} byte olabilir.`;
    }

    return true;
};


// Kullanıcı giriş validation'ı
const loginValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const {
        email,
        password,
    } = body;

    if (
        !email ||
        typeof email !== "string"
    ) {
        return "E-posta alanı zorunludur.";
    }

    const trimmedEmail =
        email.trim();

    if (
        trimmedEmail.length > 255
    ) {
        return "E-posta alanı en fazla 255 karakter olabilir.";
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailRegex.test(
            trimmedEmail
        )
    ) {
        return "Geçerli bir e-posta adresi giriniz.";
    }

    if (
        !password ||
        typeof password !== "string"
    ) {
        return "Şifre alanı zorunludur.";
    }

    if (
        !isPasswordWithinBcryptLimit(
            password
        )
    ) {
        return `Şifre UTF-8 olarak en fazla ${BCRYPT_MAX_PASSWORD_BYTES} byte olabilir.`;
    }

    return true;
};


// Şifremi unuttum validation'ı
const forgotPasswordValidation = (
    body
) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const {
        email,
    } = body;

    if (
        !email ||
        typeof email !== "string"
    ) {
        return "E-posta alanı zorunludur.";
    }

    const trimmedEmail =
        email.trim();

    if (
        trimmedEmail.length === 0
    ) {
        return "E-posta alanı boş bırakılamaz.";
    }

    if (
        trimmedEmail.length > 255
    ) {
        return "E-posta alanı en fazla 255 karakter olabilir.";
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailRegex.test(
            trimmedEmail
        )
    ) {
        return "Geçerli bir e-posta adresi giriniz.";
    }

    return true;
};


// Şifre sıfırlama validation'ı
const resetPasswordValidation = (
    body
) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const {
        token,
        password,
    } = body;

    // Reset token kontrolü
    if (
        !token ||
        typeof token !== "string"
    ) {
        return "Şifre sıfırlama token'ı zorunludur.";
    }

    // 32 byte random token -> 64 karakter hexadecimal
    if (
        !/^[a-fA-F0-9]{64}$/.test(
            token
        )
    ) {
        return "Şifre sıfırlama token'ı geçersiz.";
    }

    // Yeni şifre kontrolü
    if (
        !password ||
        typeof password !== "string"
    ) {
        return "Yeni şifre zorunludur.";
    }

    if (
        password.length < 8
    ) {
        return "Yeni şifre en az 8 karakter olmalıdır.";
    }

    if (
        !isPasswordWithinBcryptLimit(
            password
        )
    ) {
        return `Yeni şifre UTF-8 olarak en fazla ${BCRYPT_MAX_PASSWORD_BYTES} byte olabilir.`;
    }

    return true;
};


module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
};