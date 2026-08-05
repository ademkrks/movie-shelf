const authService = require("../services/auth.service");
const response = require("../utils/response");

// Yeni kullanıcı kaydı
const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);

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

module.exports = {
    register,
};