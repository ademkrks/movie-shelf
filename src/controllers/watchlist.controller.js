const watchlistService = require(
    "../services/watchlist.service"
);

const response = require(
    "../utils/response"
);


// İzleme listesine film ekler
const addWatchlist = async (
    req,
    res,
    next
) => {
    try {
        const watchlist =
            await watchlistService.addWatchlist(
                req.user.id,
                req.body.tmdbMovieId
            );

        response.success(
            res,
            watchlist,
            "Film izleme listesine eklendi.",
            201
        );
    } catch (error) {
        next(error);
    }
};


// Kullanıcının izleme listesini getirir
const getWatchlist = async (
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
            await watchlistService.getWatchlist(
                req.user.id,
                page,
                limit
            );

        response.success(
            res,
            result,
            "İzleme listesi getirildi."
        );
    } catch (error) {
        next(error);
    }
};


// İzleme listesinden film kaldırır
const removeWatchlist = async (
    req,
    res,
    next
) => {
    try {
        await watchlistService.removeWatchlist(
            req.user.id,
            Number(
                req.params.tmdbMovieId
            )
        );

        response.success(
            res,
            null,
            "Film izleme listesinden kaldırıldı."
        );
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addWatchlist,
    getWatchlist,
    removeWatchlist,
};