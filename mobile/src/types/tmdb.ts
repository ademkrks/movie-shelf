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


export type TmdbGenre = {
    id: number;

    name: string;
};


export type TmdbProductionCompany = {
    id: number;

    name: string;

    logo_path?: string | null;

    origin_country?: string;
};


export type TmdbMovieDetail =
    TmdbMovie & {
        tagline?: string;

        runtime?: number | null;

        status?: string;

        homepage?: string | null;

        imdb_id?: string | null;

        budget?: number;

        revenue?: number;

        genres?: TmdbGenre[];

        production_companies?:
            TmdbProductionCompany[];
    };


export type TmdbCastMember = {
    id: number;

    cast_id?: number;

    credit_id?: string;

    name: string;

    original_name?: string;

    character?: string;

    profile_path?: string | null;

    order?: number;

    known_for_department?: string;
};


export type TmdbTrailer = {
    id: string;

    key: string;

    name: string;

    site: string;

    type: string;

    official?: boolean;

    published_at?: string;

    size?: number;
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