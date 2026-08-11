const prisma = require("../config/prisma");
const AppError =require("../utils/AppError");

//Puan Ekler
const addRating =async (userId,tmdbMovieId,rating)=>{
    if(!Number.isInteger(rating) || rating<1 || rating>10){
        throw new AppError(
            "Puan 1 ile 10 Arasında Olmalı.",
            400
        );
    }

    const existingRating =await prisma.rating.findUnique({
        where:{
            userId_tmdbMovieId:{
                userId,
                tmdbMovieId,
            },
        },
    });
    if(existingRating){
        throw new AppError(
            "Bu Fİlme Zaten Puan Verildi.",
            400
        );
    }
    return await prisma.rating.create({
        data:{
            userId,
            tmdbMovieId,
            rating,
        },
    });
};

//Filmin Tüm Puanını ve Ortalama Puanını Getirir
const getMovieRatings =async (tmdbMovieId)=> {
    const ratings = await prisma.rating.findMany({
        where:{
            tmdbMovieId,
        },
        include:{
            user:{
                select:{
                    id: true,
                },
            },
        },
        orderBy:{
            createdAt:"desc",
        },
    });

    const aggregate= await prisma.rating.aggregate({
        where:{
            tmdbMovieId,
        },
        _avg:{
            rating: true,
        },
        _count:{
            rating :true,
        },
    });

    return {
        ratings,
        averageRatings : aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)):0,
        totalRatings :aggregate._count.rating,
    };
};

//Kullanıcının kendi Puanını Günceller 
const updateRating =async (ratingId,userId,rating)=>{
    if(!Number.isInteger(rating) || rating<1 || rating>10){
        throw new AppError(
            "Puan 1 ile 10 Arasında Olmalıdır .",
            400
        );
    }

    const existingRating =await prisma.rating.findUnique({
        where:{
            id: ratingId,
        },
    });
    if(!existingRating){
        throw new AppError(
            "Puan Bulunamadı.",
            404
        );
    }
    if(existingRating.userId !==userId){
        throw new AppError(
            "Bu Puanı Güncelleme Yetkiniz Yok.",
            403
        );
    }
    return await prisma.rating.update({
        where: {
            id: ratingId,
        },
        data: {
            rating,
        },
    });
};

//Kullanıcı Kendi Puanını Siler
const deleteRating = async (ratingId, userId) => {
    const existingRating = await prisma.rating.findUnique({
        where: {
            id: ratingId,
        },
    });

    if (!existingRating) {
        throw new AppError(
            "Puan bulunamadı.",
            404
        );
    }

    if (existingRating.userId !== userId) {
        throw new AppError(
            "Bu puanı silme yetkiniz yok.",
            403
        );
    }

    await prisma.rating.delete({
        where: {
            id: ratingId,
        },
    });
};

module.exports = {
    addRating,
    getMovieRatings,
    updateRating,
    deleteRating,
};