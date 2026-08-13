const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");


// Favoriye film ekler
const addFavorite = async (
    userId,
    tmdbMovieId
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    const existingFavorite =
        await prisma.favorite.findUnique({
            where: {
                userId_tmdbMovieId: {
                    userId,
                    tmdbMovieId:
                        normalizedMovieId,
                },
            },
        });

    if (existingFavorite) {
        throw new AppError(
            "Film zaten favorilere eklenmiş.",
            400
        );
    }

    const favorite =
        await prisma.favorite.create({
            data: {
                userId,
                tmdbMovieId:
                    normalizedMovieId,
            },
        });

    return favorite;
};


// Kullanıcının favorilerini sayfalı getirir
const getFavorites = async (
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


    /*
     * Liste ve toplam kayıt sayısı
     * paralel olarak sorgulanır.
     */
    const [
        items,
        totalItems,
    ] = await Promise.all([
        prisma.favorite.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: normalizedLimit,
        }),

        prisma.favorite.count({
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


// Favoriden film kaldırır
const removeFavorite = async (
    userId,
    tmdbMovieId
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    const favorite =
        await prisma.favorite.findUnique({
            where: {
                userId_tmdbMovieId: {
                    userId,
                    tmdbMovieId:
                        normalizedMovieId,
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
                tmdbMovieId:
                    normalizedMovieId,
            },
        },
    });
};


// Fonksiyonları dışa aktarır
module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
};