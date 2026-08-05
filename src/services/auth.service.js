const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

//Yeni Kullanıcı Oluşturur
const register =async (data)=>{
    //Aynı e-posta Kayıtlı mı Kontrol Eder 
    const existingUser = await prisma.user.findUnique({
        where: {
            email:data.email,
        },
    });

    if(existingUser){
        throw new Error("Bu e-posta Adresi Zaten Kullanılıyor.");
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

module.exports ={
    register,
};