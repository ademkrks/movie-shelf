import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    CollectionPage,
    CollectionRecord,
    FavoriteStatus,
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


export const getFavorites =
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
            `/favorites?page=${normalizedPage}&limit=${normalizedLimit}`,
            {
                auth: true,
            }
        );
    };


export const getFavoriteStatus =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<FavoriteStatus>
        >(
            `/favorites/${normalizedMovieId}/status`,
            {
                auth: true,
            }
        );
    };


export const addFavorite =
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
            "/favorites",
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


export const removeFavorite =
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
            `/favorites/${normalizedMovieId}`,
            {
                method:
                    "DELETE",

                auth: true,
            }
        );
    };