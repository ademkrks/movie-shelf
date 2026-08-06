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

//Profil Bilgilerini Güncel Tutar
const updateProfile =async (userId,data)=>{
    return await prisma.user.update({
        where:{
            id:userId,
        },
        data:{
            name : data.name,
            email: data.email,
        },
        select: {
            id :true,
            name:true,
            email:true,
            createdAt:true,
        },
    });
};


module.exports ={
    getProfile,
    updateProfile,
};