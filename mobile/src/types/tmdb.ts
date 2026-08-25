export type TmdbMovie = {
    id: number;

    title: string;

    original_title?: string;

    overview?: string;

    poster_path?: string | null;

    backdrop_path?: string | null;

    release_date?: string;

    vote_average?: number;

    vote_count?: number;

    popularity?: number;

    adult?: boolean;

    original_language?: string;

    genre_ids?: number[];
};


export type TmdbPagination = {
    page: number;

    totalPages: number;

    totalItems: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
};


export type TmdbSearchData = {
    items: TmdbMovie[];

    pagination: TmdbPagination;
};