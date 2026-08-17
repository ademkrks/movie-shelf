import {
    apiRequest,
} from "./client";


const addFavorite = async (
    tmdbMovieId
) => {
    return apiRequest(
        "/favorites",
        {
            method: "POST",

            body: JSON.stringify({
                tmdbMovieId:
                    Number(
                        tmdbMovieId
                    ),
            }),
        }
    );
};


const getFavorites = async (
    page = 1,
    limit = 20
) => {
    const params =
        new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });


    return apiRequest(
        `/favorites?${params.toString()}`
    );
};


const getFavoriteStatus = async (
    tmdbMovieId
) => {
    return apiRequest(
        `/favorites/${tmdbMovieId}/status`
    );
};


const removeFavorite = async (
    tmdbMovieId
) => {
    return apiRequest(
        `/favorites/${tmdbMovieId}`,
        {
            method: "DELETE",
        }
    );
};


const addToWatchlist = async (
    tmdbMovieId
) => {
    return apiRequest(
        "/watchlist",
        {
            method: "POST",

            body: JSON.stringify({
                tmdbMovieId:
                    Number(
                        tmdbMovieId
                    ),
            }),
        }
    );
};


const getWatchlist = async (
    page = 1,
    limit = 20
) => {
    const params =
        new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });


    return apiRequest(
        `/watchlist?${params.toString()}`
    );
};


const getWatchlistStatus = async (
    tmdbMovieId
) => {
    return apiRequest(
        `/watchlist/${tmdbMovieId}/status`
    );
};


const removeFromWatchlist =
    async (
        tmdbMovieId
    ) => {
        return apiRequest(
            `/watchlist/${tmdbMovieId}`,
            {
                method: "DELETE",
            }
        );
    };


export {
    addFavorite,
    getFavorites,
    getFavoriteStatus,
    removeFavorite,
    addToWatchlist,
    getWatchlist,
    getWatchlistStatus,
    removeFromWatchlist,
};