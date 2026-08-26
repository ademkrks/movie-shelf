import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    MovieReviewsData,
    ReviewRecord,
} from "../types/review";


const MAX_REVIEW_LENGTH =
    1000;


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


const normalizeReviewId = (
    reviewId: number
) => {
    if (
        !Number.isInteger(
            reviewId
        ) ||
        reviewId <= 0
    ) {
        throw new Error(
            "Geçersiz yorum ID."
        );
    }

    return reviewId;
};


const normalizeReviewContent = (
    content: string
) => {
    if (
        typeof content !==
        "string"
    ) {
        throw new Error(
            "Yorum içeriği geçersiz."
        );
    }


    const normalizedContent =
        content.trim();


    if (
        normalizedContent.length ===
        0
    ) {
        throw new Error(
            "Yorum içeriği boş bırakılamaz."
        );
    }


    if (
        normalizedContent.length >
        MAX_REVIEW_LENGTH
    ) {
        throw new Error(
            "Yorum içeriği en fazla 1000 karakter olabilir."
        );
    }


    return normalizedContent;
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


export const getMovieReviews =
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
                MovieReviewsData
            >
        >(
            `/reviews/movie/${normalizedMovieId}?page=${normalizedPage}&limit=${normalizedLimit}`,
            {
                auth: false,
            }
        );
    };


export const addMovieReview =
    async (
        movieId: number,
        content: string
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        const normalizedContent =
            normalizeReviewContent(
                content
            );


        return apiRequest<
            ApiResponse<
                ReviewRecord
            >
        >(
            "/reviews",
            {
                method:
                    "POST",

                auth: true,

                body:
                    JSON.stringify({
                        tmdbMovieId:
                            normalizedMovieId,

                        content:
                            normalizedContent,
                    }),
            }
        );
    };


export const updateMovieReview =
    async (
        reviewId: number,
        content: string
    ) => {
        const normalizedReviewId =
            normalizeReviewId(
                reviewId
            );

        const normalizedContent =
            normalizeReviewContent(
                content
            );


        return apiRequest<
            ApiResponse<
                ReviewRecord
            >
        >(
            `/reviews/${normalizedReviewId}`,
            {
                method:
                    "PUT",

                auth: true,

                body:
                    JSON.stringify({
                        content:
                            normalizedContent,
                    }),
            }
        );
    };


export const deleteMovieReview =
    async (
        reviewId: number
    ) => {
        const normalizedReviewId =
            normalizeReviewId(
                reviewId
            );


        return apiRequest<
            ApiResponse<null>
        >(
            `/reviews/${normalizedReviewId}`,
            {
                method:
                    "DELETE",

                auth: true,
            }
        );
    };