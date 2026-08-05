const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");

//Yeni Kullanıcı Oluşturur
const register =async (data)=>{
    //Aynı e-posta Kayıtlı mı Kontrol Eder 
    const existingUser = await prisma.user.findUnique({
        where: {
            email:data.email,
        },
    });

    if(existingUser){
        throw new AppError(
            "Bu e-posta Adresi Zaten Kayıtlı.",
            400
        );
    }
    //Şifreyi Hashler
    const hashedPassword = await bcrypt.hash(data.password,10);

    //Kulanıcıyı Oluşturur
    const user =await prisma.user.create({
        data:{
            name:data.name,
            email:data.email,
            password:hashedPassword,
        },
    });

    //Şifreyi İstemciye Göndermez
    delete user.password;
    return user;
};

    //Kullanıcı Girişi
    const login = async(data)=>{
        //Kullanıcıyı e-posta ile Bulur
        const user = await prisma.user.findUnique({
            where:{
                email:data.email,
            },
        });

        if(!user){
            throw new AppError(
                "E-posta Veya Şifre Hatalı.",
                401
            );
        }
        //Şifreyi Kontrol Eder
        const passwordMatch =await bcrypt.compare(
            data.password,
            user.password
        );

        if(!passwordMatch){
            throw new AppError(
                "E-posta Veya Şifre Hatalı.",
                401
            );
        }

        //JWT Oluşturur
        const token =generateToken(user.id);

        //Şifreyi API Cevabından Kaldırır
        delete user.password;
        return{
            user,
            token,
        };
    };

module.exports ={
    register,
    login,
};