const userService = require("../services/user.service");
const response =require ("../utils/response");

//Profil Bilgileri
const getProfile =async (req,res,next)=>{
    try{
        const user =await userService.getProfile(req.user.id);

        response.successResponse(
            res,
            user,
            "Profil Bilgileri Getirildi."
        );
    }catch(error){
        next(error);
    }
};

module.exports={
    getProfile,
};