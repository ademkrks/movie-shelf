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

//Kullanıcı Girişi
const login =async (req,res,next)=>{
    try{
        const result =await authService.login(req.body);

        response.success(
            res,
            result,
            "Giriş Başarılı."
        );
    }catch(error){
        next(error);
    }
};

module.exports = {
    register,
    login,
};