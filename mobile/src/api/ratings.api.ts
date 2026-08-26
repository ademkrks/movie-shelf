import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    MovieRatingsData,
    MyMovieRating,
    RatingRecord,
} from "../types/rating";


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


const normalizeRatingId = (
    ratingId: number
) => {
    if (
        !Number.isInteger(
            ratingId
        ) ||
        ratingId <= 0
    ) {
        throw new Error(
            "Geçersiz puan ID."
        );
    }

    return ratingId;
};


const normalizeRating = (
    rating: number
) => {
    if (
        !Number.isInteger(
            rating
        ) ||
        rating < 1 ||
        rating > 10
    ) {
        throw new Error(
            "Puan 1 ile 10 arasında tam sayı olmalıdır."
        );
    }

    return rating;
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


export const getMovieRatings =
    async (
        movieId: number,
        page = 1,
        limit = 20
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

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
                MovieRatingsData
            >
        >(
            `/ratings/movie/${normalizedMovieId}?page=${normalizedPage}&limit=${normalizedLimit}`,
            {
                auth: false,
            }
        );
    };


export const getMyMovieRating =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );


        return apiRequest<
            ApiResponse<
                MyMovieRating | null
            >
        >(
            `/ratings/movie/${normalizedMovieId}/me`,
            {
                auth: true,
            }
        );
    };


export const addMovieRating =
    async (
        movieId: number,
        rating: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        const normalizedRating =
            normalizeRating(
                rating
            );


        return apiRequest<
            ApiResponse<
                RatingRecord
            >
        >(
            "/ratings",
            {
                method:
                    "POST",

                auth: true,

                body:
                    JSON.stringify({
                        tmdbMovieId:
                            normalizedMovieId,

                        rating:
                            normalizedRating,
                    }),
            }
        );
    };


export const updateMovieRating =
    async (
        ratingId: number,
        rating: number
    ) => {
        const normalizedRatingId =
            normalizeRatingId(
                ratingId
            );

        const normalizedRating =
            normalizeRating(
                rating
            );


        return apiRequest<
            ApiResponse<
                RatingRecord
            >
        >(
            `/ratings/${normalizedRatingId}`,
            {
                method:
                    "PUT",

                auth: true,

                body:
                    JSON.stringify({
                        rating:
                            normalizedRating,
                    }),
            }
        );
    };


export const deleteMovieRating =
    async (
        ratingId: number
    ) => {
        const normalizedRatingId =
            normalizeRatingId(
                ratingId
            );


        return apiRequest<
            ApiResponse<null>
        >(
            `/ratings/${normalizedRatingId}`,
            {
                method:
                    "DELETE",

                auth: true,
            }
        );
    };