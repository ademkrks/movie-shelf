const authService = require("../services/auth.service");
const response = require("../utils/response");


// Yeni kullanıcı kaydı
const register = async (req, res, next) => {
    try {
        const user = await authService.register(
            req.body
        );

        response.success(
            res,
            user,
            "Kullanıcı başarıyla oluşturuldu.",
            201
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcı girişi
const login = async (req, res, next) => {
    try {
        const result = await authService.login(
            req.body
        );

        response.success(
            res,
            result,
            "Giriş başarılı."
        );
    } catch (error) {
        next(error);
    }
};


// Şifre sıfırlama isteği oluşturur
const forgotPassword = async (
    req,
    res,
    next
) => {
    try {
        // Service reset token oluşturur.
        // Token istemciye gönderilmez.
        await authService.forgotPassword(
            req.body
        );

        response.success(
            res,
            null,
            "Eğer bu e-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir."
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının şifresini sıfırlar
const resetPassword = async (
    req,
    res,
    next
) => {
    try {
        await authService.resetPassword(
            req.body
        );

        response.success(
            res,
            null,
            "Şifreniz başarıyla güncellendi."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
};