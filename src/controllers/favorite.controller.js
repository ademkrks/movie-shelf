const favoriteService = require(
    "../services/favorite.service"
);

const response = require(
    "../utils/response"
);


// Favoriye film ekler
const addFavorite = async (
    req,
    res,
    next
) => {
    try {
        const favorite =
            await favoriteService.addFavorite(
                req.user.id,
                req.body.tmdbMovieId
            );

        response.success(
            res,
            favorite,
            "Film favorilere eklendi.",
            201
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının favorilerini getirir
const getFavorites = async (
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
            await favoriteService.getFavorites(
                req.user.id,
                page,
                limit
            );

        response.success(
            res,
            result,
            "Favoriler getirildi."
        );
    } catch (error) {
        next(error);
    }
};


// Favoriden film kaldırır
const removeFavorite = async (
    req,
    res,
    next
) => {
    try {
        await favoriteService.removeFavorite(
            req.user.id,
            Number(
                req.params.tmdbMovieId
            )
        );

        response.success(
            res,
            null,
            "Film favorilerden kaldırıldı."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite,
};