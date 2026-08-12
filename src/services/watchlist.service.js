const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");


// İzleme listesine film ekler
const addWatchlist = async (userId, tmdbMovieId) => {
    const normalizedMovieId = Number(tmdbMovieId);

    const existingWatchlist = await prisma.watchlist.findUnique({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId: normalizedMovieId,
            },
        },
    });

    if (existingWatchlist) {
        throw new AppError(
            "Film zaten izleme listesinde.",
            400
        );
    }

    const watchlist = await prisma.watchlist.create({
        data: {
            userId,
            tmdbMovieId: normalizedMovieId,
        },
    });

    return watchlist;
};


// Kullanıcının izleme listesini getirir
const getWatchlist = async (userId) => {
    return await prisma.watchlist.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};


// İzleme listesinden film kaldırır
const removeWatchlist = async (userId, tmdbMovieId) => {
    const normalizedMovieId = Number(tmdbMovieId);

    const watchlist = await prisma.watchlist.findUnique({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId: normalizedMovieId,
            },
        },
    });

    if (!watchlist) {
        throw new AppError(
            "Film izleme listesinde bulunamadı.",
            404
        );
    }

    await prisma.watchlist.delete({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId: normalizedMovieId,
            },
        },
    });
};


// Fonksiyonları dışa aktarır
module.exports = {
    addWatchlist,
    getWatchlist,
    removeWatchlist,
};