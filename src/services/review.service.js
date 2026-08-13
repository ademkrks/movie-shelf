const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");


// Yorum ekler
const addReview = async (
    userId,
    tmdbMovieId,
    content
) => {
    const review = await prisma.review.create({
        data: {
            userId,
            tmdbMovieId: Number(tmdbMovieId),
            content: content.trim(),
        },
    });

    return review;
};


// Filmin yorumlarını sayfalı getirir
const getMovieReviews = async (
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


    const [
        items,
        totalItems,
    ] = await Promise.all([
        prisma.review.findMany({
            where: {
                tmdbMovieId:
                    normalizedMovieId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: normalizedLimit,
        }),

        prisma.review.count({
            where: {
                tmdbMovieId:
                    normalizedMovieId,
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


// Yorumu günceller
const updateReview = async (
    reviewId,
    userId,
    content
) => {
    const normalizedReviewId =
        Number(reviewId);

    const review =
        await prisma.review.findUnique({
            where: {
                id: normalizedReviewId,
            },
        });

    if (!review) {
        throw new AppError(
            "Yorum bulunamadı.",
            404
        );
    }

    // Kullanıcı sadece kendi yorumunu güncelleyebilir
    if (review.userId !== userId) {
        throw new AppError(
            "Bu yorumu güncelleme yetkiniz yok.",
            403
        );
    }

    return await prisma.review.update({
        where: {
            id: normalizedReviewId,
        },
        data: {
            content: content.trim(),
        },
    });
};


// Yorumu siler
const deleteReview = async (
    reviewId,
    userId
) => {
    const normalizedReviewId =
        Number(reviewId);

    const review =
        await prisma.review.findUnique({
            where: {
                id: normalizedReviewId,
            },
        });

    if (!review) {
        throw new AppError(
            "Yorum bulunamadı.",
            404
        );
    }

    // Kullanıcı sadece kendi yorumunu silebilir
    if (review.userId !== userId) {
        throw new AppError(
            "Bu yorumu silme yetkiniz yok.",
            403
        );
    }

    await prisma.review.delete({
        where: {
            id: normalizedReviewId,
        },
    });
};


// Fonksiyonları dışa aktarır
module.exports = {
    addReview,
    getMovieReviews,
    updateReview,
    deleteReview,
};