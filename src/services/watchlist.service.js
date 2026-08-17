const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");


// İzleme listesine film ekler
const addWatchlist = async (
    userId,
    tmdbMovieId
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    const existingWatchlist =
        await prisma.watchlist.findUnique({
            where: {
                userId_tmdbMovieId: {
                    userId,
                    tmdbMovieId:
                        normalizedMovieId,
                },
            },
        });

    if (existingWatchlist) {
        throw new AppError(
            "Film zaten izleme listesinde.",
            400
        );
    }

    const watchlist =
        await prisma.watchlist.create({
            data: {
                userId,
                tmdbMovieId:
                    normalizedMovieId,
            },
        });

    return watchlist;
};


// Kullanıcının izleme listesini sayfalı getirir
const getWatchlist = async (
    userId,
    page = 1,
    limit = 20
) => {
    const normalizedPage =
        Number(page);

    const normalizedLimit =
        Number(limit);

    const skip =
        (normalizedPage - 1) *
        normalizedLimit;


    const [
        items,
        totalItems,
    ] = await Promise.all([
        prisma.watchlist.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: normalizedLimit,
        }),

        prisma.watchlist.count({
            where: {
                userId,
            },
        }),
    ]);


    const totalPages =
        Math.ceil(
            totalItems /
            normalizedLimit
        );


    return {
        items,
        pagination: {
            page: normalizedPage,
            limit: normalizedLimit,
            totalItems,
            totalPages,
            hasNextPage:
                normalizedPage <
                totalPages,
            hasPreviousPage:
                normalizedPage > 1,
        },
    };
};


// Filmin izleme listesi durumunu kontrol eder
const getWatchlistStatus = async (
    userId,
    tmdbMovieId
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    const watchlist =
        await prisma.watchlist.findUnique({
            where: {
                userId_tmdbMovieId: {
                    userId,
                    tmdbMovieId:
                        normalizedMovieId,
                },
            },
            select: {
                id: true,
            },
        });


    return {
        isWatchlisted:
            Boolean(watchlist),
    };
};


// İzleme listesinden film kaldırır
const removeWatchlist = async (
    userId,
    tmdbMovieId
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    const watchlist =
        await prisma.watchlist.findUnique({
            where: {
                userId_tmdbMovieId: {
                    userId,
                    tmdbMovieId:
                        normalizedMovieId,
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
                tmdbMovieId:
                    normalizedMovieId,
            },
        },
    });
};


// Fonksiyonları dışa aktarır
module.exports = {
    addWatchlist,
    getWatchlist,
    getWatchlistStatus,
    removeWatchlist,
};