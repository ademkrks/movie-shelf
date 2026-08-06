const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// Favoriye film ekler
const addFavorite = async (userId, tmdbMovieId) => {
    const existingFavorite = await prisma.favorite.findUnique({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId,
            },
        },
    });

    if (existingFavorite) {
        throw new AppError(
            "Film zaten favorilere eklenmiş.",
            400
        );
    }

    const favorite = await prisma.favorite.create({
        data: {
            userId,
            tmdbMovieId,
        },
    });

    return favorite;
};

// Kullanıcının favorilerini getirir
const getFavorites = async (userId) => {
    return await prisma.favorite.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

// Favoriden film kaldırır
const removeFavorite = async (userId, tmdbMovieId) => {
    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId,
            },
        },
    });

    if (!favorite) {
        throw new AppError(
            "Favori bulunamadı.",
            404
        );
    }

    await prisma.favorite.delete({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId,
            },
        },
    });
};

module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
};