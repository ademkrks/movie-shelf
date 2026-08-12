const userService = require("../services/user.service");
const response = require("../utils/response");

// Kullanıcı profil bilgilerini getirir
const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user.id);

        response.success(
            res,
            user,
            "Profil Bilgileri Getirildi."
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
            "Profil Başarıyla Güncellendi."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getProfile,
    updateProfile,
};