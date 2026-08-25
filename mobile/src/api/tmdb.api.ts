import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    TmdbCastMember,
    TmdbMovie,
    TmdbMovieDetail,
    TmdbSearchData,
    TmdbTrailer,
} from "../types/tmdb";


type TmdbMovieBatchData = {
    items:
        TmdbMovieDetail[];

    failedMovieIds:
        number[];
};


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


const normalizeMovieIds = (
    movieIds: number[]
) => {
    const normalizedMovieIds =
        [
            ...new Set(
                movieIds.map(
                    (
                        movieId
                    ) =>
                        normalizeMovieId(
                            movieId
                        )
                )
            ),
        ];


    if (
        normalizedMovieIds.length ===
        0
    ) {
        throw new Error(
            "En az bir film ID gereklidir."
        );
    }


    if (
        normalizedMovieIds.length >
        20
    ) {
        throw new Error(
            "Tek istekte en fazla 20 film getirilebilir."
        );
    }


    return normalizedMovieIds;
};


export const getTrendingMovies =
    async () => {
        return apiRequest<
            ApiResponse<TmdbMovie[]>
        >(
            "/tmdb/trending",
            {
                auth: false,
            }
        );
    };


export const getPopularMovies =
    async () => {
        return apiRequest<
            ApiResponse<TmdbMovie[]>
        >(
            "/tmdb/popular",
            {
                auth: false,
            }
        );
    };


export const getTopRatedMovies =
    async () => {
        return apiRequest<
            ApiResponse<TmdbMovie[]>
        >(
            "/tmdb/top-rated",
            {
                auth: false,
            }
        );
    };


export const getUpcomingMovies =
    async () => {
        return apiRequest<
            ApiResponse<TmdbMovie[]>
        >(
            "/tmdb/upcoming",
            {
                auth: false,
            }
        );
    };


export const searchMovies =
    async (
        query: string,
        page = 1
    ) => {
        const normalizedQuery =
            query.trim();

        const normalizedPage =
            Math.max(
                1,
                Math.trunc(
                    page
                )
            );

        const encodedQuery =
            encodeURIComponent(
                normalizedQuery
            );

        return apiRequest<
            ApiResponse<TmdbSearchData>
        >(
            `/tmdb/search?q=${encodedQuery}&page=${normalizedPage}`,
            {
                auth: false,
            }
        );
    };


export const getMovieDetails =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<TmdbMovieDetail>
        >(
            `/tmdb/movie/${normalizedMovieId}`,
            {
                auth: false,
            }
        );
    };


export const getMovieDetailsBatch =
    async (
        movieIds: number[]
    ) => {
        const normalizedMovieIds =
            normalizeMovieIds(
                movieIds
            );

        return apiRequest<
            ApiResponse<TmdbMovieBatchData>
        >(
            "/tmdb/movies/batch",
            {
                method:
                    "POST",

                auth: true,

                body:
                    JSON.stringify({
                        movieIds:
                            normalizedMovieIds,
                    }),
            }
        );
    };


export const getMovieCast =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<TmdbCastMember[]>
        >(
            `/tmdb/movie/${normalizedMovieId}/cast`,
            {
                auth: false,
            }
        );
    };


export const getMovieTrailers =
    async (
        movieId: number
    ) => {
        const normalizedMovieId =
            normalizeMovieId(
                movieId
            );

        return apiRequest<
            ApiResponse<TmdbTrailer[]>
        >(
            `/tmdb/movie/${normalizedMovieId}/trailers`,
            {
                auth: false,
            }
        );
    };