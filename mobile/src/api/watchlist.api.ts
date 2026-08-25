import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    CollectionPage,
    CollectionRecord,
    WatchlistStatus,
} from "../types/library";


const normalizeMovieId = (
    movieId: number
) => {
    if (
        !Number.isInteger(
            movieId
        ) ||
        movieId <= 0
    ) {
        throw new Error(
            "Geçersiz film ID."
        );
    }

    return movieId;
};


const normalizePage = (
    page: number
) => {
    return Math.max(
        1,
        Math.trunc(
            page
        )
    );
};


const normalizeLimit = (
    limit: number
) => {
    return Math.min(
        100,
        Math.max(
            1,
            Math.trunc(
                limit
            )
        )
    );
};


export const getWatchlist =
    async (
        page = 1,
        limit = 20
    ) => {
        const normalizedPage =
            normalizePage(
                page
            );

        const normalizedLimit =
            normalizeLimit(
                limit
            );

        return apiRequest<
            ApiResponse<
                CollectionPage
            >
        >(
            `/watchlist?page=${normalizedPage}&limit=${normalizedLimit}`,
            {
                auth: true,
            }
        );
    };


export const getWatchlistStatus =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<WatchlistStatus>
        >(
            `/watchlist/${normalizedMovieId}/status`,
            {
                auth: true,
            }
        );
    };


export const addToWatchlist =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<CollectionRecord>
        >(
            "/watchlist",
            {
                method:
                    "POST",

                auth: true,

                body:
                    JSON.stringify({
                        tmdbMovieId:
                            normalizedMovieId,
                    }),
            }
        );
    };


export const removeFromWatchlist =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<null>
        >(
            `/watchlist/${normalizedMovieId}`,
            {
                method:
                    "DELETE",

                auth: true,
            }
        );
    };