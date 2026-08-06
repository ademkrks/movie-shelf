const prisma =require("../config/prisma");

//Giriş Yapan Kullanıcıın Profilini Getirir
const getProfile = async (userId)=>{
    return await prisma.user.findUnique({
        where:{
            id: userId,
        },
        select:{
            id: true,
            name:true,
            email:true,
            createdAt:true,
        },
    });
};

module.exports ={
    getProfile,
};