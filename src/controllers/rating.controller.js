const ratingService = require(
    "../services/rating.service"
);

const response = require(
    "../utils/response"
);


// Filme puan ekler
const addRating = async (
    req,
    res,
    next
) => {
    try {
        const rating =
            await ratingService.addRating(
                req.user.id,
                Number(
                    req.body.tmdbMovieId
                ),
                Number(
                    req.body.rating
                )
            );

        response.success(
            res,
            rating,
            "Film başarıyla puanlandı.",
            201
        );
    } catch (error) {
        next(error);
    }
};


// Filmin puanlarını getirir
const getMovieRatings = async (
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
            await ratingService.getMovieRatings(
                Number(
                    req.params.tmdbMovieId
                ),
                page,
                limit
            );

        response.success(
            res,
            result,
            "Film puanları getirildi."
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının filme verdiği kendi puanını getirir
const getMyRating = async (
    req,
    res,
    next
) => {
    try {
        const rating =
            await ratingService.getMyRating(
                req.user.id,
                Number(
                    req.params.tmdbMovieId
                )
            );

        response.success(
            res,
            rating,
            "Kullanıcının film puanı getirildi."
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının puanını günceller
const updateRating = async (
    req,
    res,
    next
) => {
    try {
        const rating =
            await ratingService.updateRating(
                Number(req.params.id),
                req.user.id,
                Number(
                    req.body.rating
                )
            );

        response.success(
            res,
            rating,
            "Film puanı güncellendi."
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının puanını siler
const deleteRating = async (
    req,
    res,
    next
) => {
    try {
        await ratingService.deleteRating(
            Number(req.params.id),
            req.user.id
        );

        response.success(
            res,
            null,
            "Film puanı silindi."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addRating,
    getMovieRatings,
    getMyRating,
    updateRating,
    deleteRating,
};