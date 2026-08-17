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


const getAllCollectionItems =
    async (
        collectionRequest
    ) => {
        const items = [];

        let page = 1;
        let hasNextPage = true;


        while (hasNextPage) {
            const response =
                await collectionRequest(
                    page,
                    100
                );


            const data =
                response.data;


            items.push(
                ...(
                    data?.items ||
                    []
                )
            );


            hasNextPage =
                Boolean(
                    data?.pagination
                        ?.hasNextPage
                );

            page += 1;
        }


        return items;
    };


const getAllFavorites =
    async () => {
        return getAllCollectionItems(
            getFavorites
        );
    };


const getAllWatchlist =
    async () => {
        return getAllCollectionItems(
            getWatchlist
        );
    };


export {
    addFavorite,
    getFavorites,
    getAllFavorites,
    removeFavorite,
    addToWatchlist,
    getWatchlist,
    getAllWatchlist,
    removeFromWatchlist,
};