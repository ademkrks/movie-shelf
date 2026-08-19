const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");


// Puan ekler
const addRating = async (
    userId,
    tmdbMovieId,
    rating
) => {
    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 10
    ) {
        throw new AppError(
            "Puan 1 ile 10 arasında olmalıdır.",
            400
        );
    }

    const existingRating =
        await prisma.rating.findUnique({
            where: {
                userId_tmdbMovieId: {
                    userId,
                    tmdbMovieId,
                },
            },
        });

    if (existingRating) {
        throw new AppError(
            "Bu filme zaten puan verdiniz.",
            400
        );
    }

    return await prisma.rating.create({
        data: {
            userId,
            tmdbMovieId,
            rating,
        },
    });
};


// Filmin puanlarını sayfalı getirir ve genel ortalamayı hesaplar
const getMovieRatings = async (
    tmdbMovieId,
    page = 1,
    limit = 20
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    const normalizedPage =
        Number(page);

    const normalizedLimit =
        Number(limit);

    const skip =
        (normalizedPage - 1) *
        normalizedLimit;


    /*
     * Sayfadaki kayıtlar ve filmin tüm
     * puanlarına ait istatistikler paralel alınır.
     */
    const [
        items,
        aggregate,
    ] = await Promise.all([
        prisma.rating.findMany({
            where: {
                tmdbMovieId:
                    normalizedMovieId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: normalizedLimit,
        }),

        prisma.rating.aggregate({
            where: {
                tmdbMovieId:
                    normalizedMovieId,
            },
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        }),
    ]);


    const totalItems =
        aggregate._count.rating;

    const totalPages =
        Math.ceil(
            totalItems /
            normalizedLimit
        );


    return {
        items,
        averageRatings:
            aggregate._avg.rating
                ? Number(
                    aggregate._avg.rating
                        .toFixed(2)
                )
                : 0,
        totalRatings: totalItems,
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


// Kullanıcının belirli bir filme verdiği puanı getirir
const getMyRating = async (
    userId,
    tmdbMovieId
) => {
    const normalizedMovieId =
        Number(tmdbMovieId);

    return await prisma.rating.findUnique({
        where: {
            userId_tmdbMovieId: {
                userId,
                tmdbMovieId:
                    normalizedMovieId,
            },
        },
        select: {
            id: true,
            tmdbMovieId: true,
            rating: true,
        },
    });
};


// Kullanıcının kendi puanını günceller
const updateRating = async (
    ratingId,
    userId,
    rating
) => {
    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 10
    ) {
        throw new AppError(
            "Puan 1 ile 10 arasında olmalıdır.",
            400
        );
    }

    const existingRating =
        await prisma.rating.findUnique({
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

    if (
        existingRating.userId !==
        userId
    ) {
        throw new AppError(
            "Bu puanı güncelleme yetkiniz yok.",
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


// Kullanıcı kendi puanını siler
const deleteRating = async (
    ratingId,
    userId
) => {
    const existingRating =
        await prisma.rating.findUnique({
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

    if (
        existingRating.userId !==
        userId
    ) {
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
    getMyRating,
    updateRating,
    deleteRating,
};