export type ReviewRecord = {
    id: number;

    userId: number;

    tmdbMovieId: number;

    content: string;

    createdAt: string;

    updatedAt: string;
};


export type MovieReviewItem = {
    id: number;

    userId: number;

    tmdbMovieId: number;

    content: string;

    createdAt: string;

    updatedAt: string;

    user: {
        id: number;

        name: string;
    };
};


export type ReviewPaginationData = {
    page: number;

    limit: number;

    totalItems: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
};


export type MovieReviewsData = {
    items: MovieReviewItem[];

    pagination: ReviewPaginationData;
};