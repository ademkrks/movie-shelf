import {
    apiRequest,
} from "./client";

import type {
    ApiResponse,
} from "../types/api";

import type {
    TmdbSearchData,
} from "../types/tmdb";


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