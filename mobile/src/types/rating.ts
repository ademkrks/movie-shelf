export type RatingRecord = {
    id: number;

    userId: number;

    tmdbMovieId: number;

    rating: number;

    createdAt: string;

    updatedAt: string;
};


export type MyMovieRating = {
    id: number;

    tmdbMovieId: number;

    rating: number;
};


export type MovieRatingItem = {
    id: number;

    userId: number;

    tmdbMovieId: number;

    rating: number;

    createdAt: string;

    updatedAt: string;

    user: {
        id: number;
    };
};


export type PaginationData = {
    page: number;

    limit: number;

    totalItems: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
};


export type MovieRatingsData = {
    items: MovieRatingItem[];

    averageRatings: number;

    totalRatings: number;

    pagination: PaginationData;
};