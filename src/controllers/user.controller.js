const userService = require("../services/user.service");
const response = require("../utils/response");


// Kullanıcı profil bilgilerini getirir
const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(
            req.user.id
        );

        response.success(
            res,
            user,
            "Profil bilgileri getirildi."
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcı profil bilgilerini günceller
const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(
            req.user.id,
            req.body
        );

        response.success(
            res,
            user,
            "Profil başarıyla güncellendi."
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının şifresini değiştirir
const changePassword = async (req, res, next) => {
    try {
        await userService.changePassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
        );

        response.success(
            res,
            null,
            "Şifre başarıyla değiştirildi. Lütfen tekrar giriş yapın."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};