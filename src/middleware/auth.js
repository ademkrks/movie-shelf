const jwt =require("jsonwebtoken");

const prisma =require("../config/prisma");
const AppError =require("../utils/AppError");

const auth= async(req,res,next)=>{
    try{
        //Authorization Header'ını alır
        const authHeader =req.headers.authorization;

        if(
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ){
            throw new AppError(
                "Yetkilendirme Başarısız.",
                401
            );
        }
        //Bearer Token'ı Ayıklar
        const token =authHeader.split(" ")[1];
        //Token Doğrular
        const decoded =jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        //Kullanıcıyı Veri Tabanında Arar
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
        //Şifreyi İstemciye Göndermemek İçin Kaldırır
        delete user.password;
        //Request'e Kullanıcıyı Ekler
        req.user =user;

        next();
    }catch(error){
        next(error);
    }
};

module.exports =auth;