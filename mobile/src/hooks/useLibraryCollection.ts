import {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    ApiClientError,
} from "../api/client";

import {
    getFavorites,
    removeFavorite,
} from "../api/favorites.api";

import {
    getMovieDetailsBatch,
} from "../api/tmdb.api";

import {
    getWatchlist,
    removeFromWatchlist,
} from "../api/watchlist.api";

import type {
    CollectionKind,
    CollectionMovie,
    CollectionPagination,
    CollectionRecord,
} from "../types/library";

import type {
    TmdbMovieDetail,
} from "../types/tmdb";


const COLLECTION_PAGE_SIZE =
    20;


type LoadCollectionOptions = {
    refreshing?: boolean;

    append?: boolean;
};


const getRequestErrorMessage = (
    error: unknown
) => {
    if (
        error instanceof
        ApiClientError
    ) {
        return (
            error.errors[0] ??
            error.message
        );
    }

    if (
        error instanceof
        Error
    ) {
        return error.message;
    }

    return "Koleksiyon yüklenirken bilinmeyen bir hata oluştu.";
};


export default function useLibraryCollection() {
    const [
        activeCollection,
        setActiveCollection,
    ] =
        useState<
            CollectionKind
        >(
            "favorites"
        );


    const [
        movies,
        setMovies,
    ] =
        useState<
            CollectionMovie[]
        >(
            []
        );


    const [
        pagination,
        setPagination,
    ] =
        useState<
            CollectionPagination | null
        >(
            null
        );


    const [
        isLoading,
        setIsLoading,
    ] =
        useState(
            true
        );


    const [
        isRefreshing,
        setIsRefreshing,
    ] =
        useState(
            false
        );


    const [
        isLoadingMore,
        setIsLoadingMore,
    ] =
        useState(
            false
        );


    const [
        removingMovieId,
        setRemovingMovieId,
    ] =
        useState<
            number | null
        >(
            null
        );


    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        partialWarning,
        setPartialWarning,
    ] =
        useState<
            string | null
        >(
            null
        );


    const requestIdRef =
        useRef(
            0
        );


    const activeCollectionRef =
        useRef<
            CollectionKind
        >(
            "favorites"
        );


    const loadCollectionPage =
        useCallback(
            async (
                collection:
                    CollectionKind,

                page:
                    number,

                options:
                    LoadCollectionOptions =
                        {}
            ) => {
                const {
                    refreshing =
                        false,

                    append =
                        false,
                } =
                    options;


                const requestId =
                    ++requestIdRef.current;


                if (
                    refreshing
                ) {
                    setIsRefreshing(
                        true
                    );
                } else if (
                    append
                ) {
                    setIsLoadingMore(
                        true
                    );
                } else {
                    setIsLoading(
                        true
                    );

                    setMovies(
                        []
                    );

                    setPagination(
                        null
                    );
                }


                setError(
                    null
                );


                if (
                    !append
                ) {
                    setPartialWarning(
                        null
                    );
                }


                try {
                    const collectionResponse =
                        collection ===
                        "favorites"
                            ? await getFavorites(
                                page,
                                COLLECTION_PAGE_SIZE
                            )
                            : await getWatchlist(
                                page,
                                COLLECTION_PAGE_SIZE
                            );


                    if (
                        requestId !==
                        requestIdRef.current
                    ) {
                        return false;
                    }


                    const collectionData =
                        collectionResponse
                            .data;


                    if (
                        !collectionData
                    ) {
                        throw new Error(
                            "Koleksiyon verisi alınamadı."
                        );
                    }


                    const records:
                        CollectionRecord[] =
                            collectionData
                                .items ??
                            [];


                    let enrichedMovies:
                        CollectionMovie[] =
                            [];


                    let failedMovieIds:
                        number[] =
                            [];


                    if (
                        records.length >
                        0
                    ) {
                        const movieIds =
                            records.map(
                                (
                                    record
                                ) =>
                                    Number(
                                        record.tmdbMovieId
                                    )
                            );


                        const movieResponse =
                            await getMovieDetailsBatch(
                                movieIds
                            );


                        if (
                            requestId !==
                            requestIdRef.current
                        ) {
                            return false;
                        }


                        const movieDetails =
                            movieResponse
                                .data
                                ?.items ??
                            [];


                        failedMovieIds =
                            movieResponse
                                .data
                                ?.failedMovieIds ??
                            [];


                        const moviesById =
                            new Map<
                                number,
                                TmdbMovieDetail
                            >(
                                movieDetails.map(
                                    (
                                        movie
                                    ) => [
                                        Number(
                                            movie.id
                                        ),

                                        movie,
                                    ]
                                )
                            );


                        enrichedMovies =
                            records
                                .map(
                                    (
                                        record
                                    ) => {
                                        const movie =
                                            moviesById.get(
                                                Number(
                                                    record.tmdbMovieId
                                                )
                                            );


                                        if (
                                            !movie
                                        ) {
                                            return null;
                                        }


                                        return {
                                            ...movie,

                                            collectionCreatedAt:
                                                record.createdAt,
                                        };
                                    }
                                )
                                .filter(
                                    (
                                        movie
                                    ):
                                        movie is
                                            CollectionMovie =>
                                        movie !==
                                        null
                                );
                    }


                    if (
                        requestId !==
                        requestIdRef.current
                    ) {
                        return false;
                    }


                    if (
                        append
                    ) {
                        setMovies(
                            (
                                currentMovies
                            ) => {
                                const existingIds =
                                    new Set(
                                        currentMovies.map(
                                            (
                                                movie
                                            ) =>
                                                movie.id
                                        )
                                    );


                                const newMovies =
                                    enrichedMovies.filter(
                                        (
                                            movie
                                        ) =>
                                            !existingIds.has(
                                                movie.id
                                            )
                                    );


                                return [
                                    ...currentMovies,

                                    ...newMovies,
                                ];
                            }
                        );
                    } else {
                        setMovies(
                            enrichedMovies
                        );
                    }


                    setPagination(
                        collectionData
                            .pagination
                    );


                    if (
                        failedMovieIds.length >
                        0
                    ) {
                        setPartialWarning(
                            `${failedMovieIds.length} filmin detayları şu anda getirilemedi.`
                        );
                    }


                    return true;
                } catch (
                    requestError
                ) {
                    if (
                        requestId !==
                        requestIdRef.current
                    ) {
                        return false;
                    }


                    setError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    if (
                        !append &&
                        !refreshing
                    ) {
                        setMovies(
                            []
                        );

                        setPagination(
                            null
                        );
                    }


                    return false;
                } finally {
                    if (
                        requestId ===
                        requestIdRef.current
                    ) {
                        setIsLoading(
                            false
                        );

                        setIsRefreshing(
                            false
                        );

                        setIsLoadingMore(
                            false
                        );
                    }
                }
            },
            []
        );


    const loadCollection =
        useCallback(
            () => {
                return loadCollectionPage(
                    activeCollection,
                    1
                );
            },
            [
                activeCollection,
                loadCollectionPage,
            ]
        );


    const changeCollection =
        useCallback(
            (
                collection:
                    CollectionKind
            ) => {
                if (
                    collection ===
                    activeCollection
                ) {
                    return;
                }


                /*
                 * Önceki koleksiyona ait devam eden isteği
                 * geçersiz kılar.
                 */
                ++requestIdRef.current;


                /*
                 * Ref yalnızca kullanıcı koleksiyon
                 * değiştirdiğinde güncellenir.
                 */
                activeCollectionRef.current =
                    collection;


                setActiveCollection(
                    collection
                );


                setMovies(
                    []
                );

                setPagination(
                    null
                );

                setError(
                    null
                );

                setPartialWarning(
                    null
                );

                setIsLoading(
                    true
                );

                setIsRefreshing(
                    false
                );

                setIsLoadingMore(
                    false
                );
            },
            [
                activeCollection,
            ]
        );


    const refreshCollection =
        useCallback(
            () => {
                return loadCollectionPage(
                    activeCollection,
                    1,
                    {
                        refreshing:
                            true,
                    }
                );
            },
            [
                activeCollection,
                loadCollectionPage,
            ]
        );


    const loadMore =
        useCallback(
            () => {
                if (
                    !pagination ||
                    !pagination.hasNextPage ||
                    isLoadingMore ||
                    isLoading ||
                    isRefreshing
                ) {
                    return Promise.resolve(
                        false
                    );
                }


                return loadCollectionPage(
                    activeCollection,
                    pagination.page +
                        1,
                    {
                        append:
                            true,
                    }
                );
            },
            [
                activeCollection,
                isLoading,
                isLoadingMore,
                isRefreshing,
                loadCollectionPage,
                pagination,
            ]
        );


    const removeMovie =
        useCallback(
            async (
                movieId: number
            ) => {
                if (
                    removingMovieId !==
                    null
                ) {
                    return false;
                }


                const collection =
                    activeCollection;


                setRemovingMovieId(
                    movieId
                );

                setError(
                    null
                );


                try {
                    if (
                        collection ===
                        "favorites"
                    ) {
                        await removeFavorite(
                            movieId
                        );
                    } else {
                        await removeFromWatchlist(
                            movieId
                        );
                    }


                    /*
                     * Kullanıcı silme isteği sırasında sekme
                     * değiştirdiyse yeni koleksiyon state'ine
                     * eski isteğin sonucunu uygulama.
                     */
                    if (
                        activeCollectionRef.current !==
                        collection
                    ) {
                        return true;
                    }


                    setMovies(
                        (
                            currentMovies
                        ) =>
                            currentMovies.filter(
                                (
                                    movie
                                ) =>
                                    movie.id !==
                                    movieId
                            )
                    );


                    setPagination(
                        (
                            currentPagination
                        ) => {
                            if (
                                !currentPagination
                            ) {
                                return null;
                            }


                            const nextTotalItems =
                                Math.max(
                                    0,
                                    currentPagination
                                        .totalItems -
                                        1
                                );


                            const nextTotalPages =
                                Math.ceil(
                                    nextTotalItems /
                                    currentPagination
                                        .limit
                                );


                            const nextPage =
                                nextTotalPages ===
                                0
                                    ? 1
                                    : Math.min(
                                        currentPagination
                                            .page,
                                        nextTotalPages
                                    );


                            return {
                                ...currentPagination,

                                page:
                                    nextPage,

                                totalItems:
                                    nextTotalItems,

                                totalPages:
                                    nextTotalPages,

                                hasPreviousPage:
                                    nextPage >
                                    1,

                                hasNextPage:
                                    nextPage <
                                    nextTotalPages,
                            };
                        }
                    );


                    return true;
                } catch (
                    requestError
                ) {
                    if (
                        activeCollectionRef.current ===
                        collection
                    ) {
                        setError(
                            getRequestErrorMessage(
                                requestError
                            )
                        );
                    }


                    return false;
                } finally {
                    setRemovingMovieId(
                        null
                    );
                }
            },
            [
                activeCollection,
                removingMovieId,
            ]
        );


    const totalItems =
        pagination
            ?.totalItems ??
        movies.length;


    return {
        activeCollection,

        movies,

        pagination,

        totalItems,

        isLoading,
        isRefreshing,
        isLoadingMore,

        removingMovieId,

        error,
        partialWarning,

        loadCollection,
        changeCollection,
        refreshCollection,
        loadMore,
        removeMovie,
    };
}