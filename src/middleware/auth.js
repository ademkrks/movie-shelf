const jwt =require("jsonwebtoken");

const prisma =require("../config/prisma");
const AppError =require("../utils/AppError");

const auth= async(req,res,next)=>{
    try{
        const authHeader =req.headers.authorization;

        if(
            !authHeader ||
            !authHeader.startsWith("Bearer")
        ){
            throw new AppError(
                "Yetkilendirme Başarısız.",
                401
            );
        }

        const token =authHeader.split(" ")[1];

        const decoded =jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user =await prisma.user.findUnique({
            where:{
                id:decoded.id,
            },
        });
        if(!user){
            throw new AppError(
                "Kullanıcı Bulunamadı.",
                401
            );
        }
        delete user.password;
        req.user =user;

        next();
    }catch(error){
        next(error);
    }
};

module.exports =auth;