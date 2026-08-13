const reviewService = require(
    "../services/review.service"
);

const response = require(
    "../utils/response"
);


// Yorum ekler
const addReview = async (
    req,
    res,
    next
) => {
    try {
        const review =
            await reviewService.addReview(
                req.user.id,
                req.body.tmdbMovieId,
                req.body.content
            );

        response.success(
            res,
            review,
            "Yorum başarıyla eklendi.",
            201
        );
    } catch (error) {
        next(error);
    }
};


// Filmin yorumlarını getirir
const getMovieReviews = async (
    req,
    res,
    next
) => {
    try {
        const page =
            req.query.page !== undefined
                ? Number(req.query.page)
                : 1;

        const limit =
            req.query.limit !== undefined
                ? Number(req.query.limit)
                : 20;


        const result =
            await reviewService.getMovieReviews(
                Number(
                    req.params.tmdbMovieId
                ),
                page,
                limit
            );

        response.success(
            res,
            result,
            "Film yorumları getirildi."
        );
    } catch (error) {
        next(error);
    }
};


// Yorumu günceller
const updateReview = async (
    req,
    res,
    next
) => {
    try {
        const review =
            await reviewService.updateReview(
                Number(req.params.id),
                req.user.id,
                req.body.content
            );

        response.success(
            res,
            review,
            "Yorum güncellendi."
        );
    } catch (error) {
        next(error);
    }
};


// Yorumu siler
const deleteReview = async (
    req,
    res,
    next
) => {
    try {
        await reviewService.deleteReview(
            Number(req.params.id),
            req.user.id
        );

        response.success(
            res,
            null,
            "Yorum silindi."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addReview,
    getMovieReviews,
    updateReview,
    deleteReview,
};