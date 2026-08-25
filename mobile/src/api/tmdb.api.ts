import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    TmdbMovie,
    TmdbSearchData,
} from "../types/tmdb";


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