export type CollectionRecord = {
    id: number;

    userId: number;

    tmdbMovieId: number;

    createdAt: string;
};


export type CollectionPagination = {
    page: number;

    limit: number;

    totalItems: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
};


export type CollectionPage<
    TItem extends CollectionRecord =
        CollectionRecord,
> = {
    items: TItem[];

    pagination:
        CollectionPagination;
};


export type FavoriteStatus = {
    isFavorite: boolean;
};


export type WatchlistStatus = {
    isWatchlisted: boolean;
};