const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// Yorum ekler
const addReview = async (userId, tmdbMovieId, content) => {
    const review = await prisma.review.create({
        data: {
            userId,
            tmdbMovieId,
            content,
        },
    });

    return review;
};

// Filmin yorumlarını getirir
const getMovieReviews = async (tmdbMovieId) => {
    return await prisma.review.findMany({
        where: {
            tmdbMovieId,
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
    });
};

// Yorumu günceller
const updateReview = async (reviewId, userId, content) => {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId,
        },
    });

    if (!review) {
        throw new AppError(
            "Yorum bulunamadı.",
            404
        );
    }

    if (review.userId !== userId) {
        throw new AppError(
            "Bu yorumu güncelleme yetkiniz yok.",
            403
        );
    }

    return await prisma.review.update({
        where: {
            id: reviewId,
        },
        data: {
            content,
        },
    });
};

// Yorumu siler
const deleteReview = async (reviewId, userId) => {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId,
        },
    });

    if (!review) {
        throw new AppError(
            "Yorum bulunamadı.",
            404
        );
    }

    if (review.userId !== userId) {
        throw new AppError(
            "Bu yorumu silme yetkiniz yok.",
            403
        );
    }

    await prisma.review.delete({
        where: {
            id: reviewId,
        },
    });
};

module.exports = {
    addReview,
    getMovieReviews,
    updateReview,
    deleteReview,
};