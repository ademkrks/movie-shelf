import {
    useCallback,
    useState,
} from "react";

import {
    useRouter,
} from "expo-router";

import {
    ApiClientError,
} from "../api/client";

import {
    addFavorite,
    getFavoriteStatus,
    removeFavorite,
} from "../api/favorites.api";

import {
    addToWatchlist,
    getWatchlistStatus,
    removeFromWatchlist,
} from "../api/watchlist.api";


type UseMovieLibraryParams = {
    movieId: number;
    isValidMovieId: boolean;
    isAuthenticated: boolean;
    isRestoring: boolean;
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

    return "Film bilgileri yüklenirken bilinmeyen bir hata oluştu.";
};


const useMovieLibrary = ({
    movieId,
    isValidMovieId,
    isAuthenticated,
    isRestoring,
}: UseMovieLibraryParams) => {
    const router =
        useRouter();


    const [
        isFavorite,
        setIsFavorite,
    ] =
        useState(
            false
        );


    const [
        isWatchlisted,
        setIsWatchlisted,
    ] =
        useState(
            false
        );


    const [
        isLibraryStatusLoading,
        setIsLibraryStatusLoading,
    ] =
        useState(
            false
        );


    const [
        isFavoritePending,
        setIsFavoritePending,
    ] =
        useState(
            false
        );


    const [
        isWatchlistPending,
        setIsWatchlistPending,
    ] =
        useState(
            false
        );


    const [
        libraryActionError,
        setLibraryActionError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const resetLibraryState =
        useCallback(
            () => {
                setIsFavorite(
                    false
                );

                setIsWatchlisted(
                    false
                );

                setIsLibraryStatusLoading(
                    false
                );

                setIsFavoritePending(
                    false
                );

                setIsWatchlistPending(
                    false
                );

                setLibraryActionError(
                    null
                );
            },
            []
        );


    const loadLibraryStatus =
        useCallback(
            async () => {
                if (
                    isRestoring
                ) {
                    return;
                }


                if (
                    !isValidMovieId
                ) {
                    resetLibraryState();

                    return;
                }


                if (
                    !isAuthenticated
                ) {
                    resetLibraryState();

                    return;
                }


                /*
                 * Yeni filme geçildiğinde önceki filmin
                 * favori/watchlist durumu ekranda kalmasın.
                 */
                setIsFavorite(
                    false
                );

                setIsWatchlisted(
                    false
                );

                setIsLibraryStatusLoading(
                    true
                );

                setLibraryActionError(
                    null
                );


                const results =
                    await Promise.allSettled([
                        getFavoriteStatus(
                            movieId
                        ),

                        getWatchlistStatus(
                            movieId
                        ),
                    ]);


                const [
                    favoriteResult,
                    watchlistResult,
                ] =
                    results;


                if (
                    favoriteResult.status ===
                    "fulfilled"
                ) {
                    setIsFavorite(
                        favoriteResult.value
                            .data
                            ?.isFavorite ??
                            false
                    );
                }


                if (
                    watchlistResult.status ===
                    "fulfilled"
                ) {
                    setIsWatchlisted(
                        watchlistResult.value
                            .data
                            ?.isWatchlisted ??
                            false
                    );
                }


                if (
                    favoriteResult.status ===
                        "rejected" ||
                    watchlistResult.status ===
                        "rejected"
                ) {
                    const failedResult =
                        favoriteResult.status ===
                        "rejected"
                            ? favoriteResult
                            : watchlistResult;


                    setLibraryActionError(
                        failedResult.status ===
                            "rejected"
                            ? getRequestErrorMessage(
                                failedResult.reason
                            )
                            : "Koleksiyon durumu yüklenemedi."
                    );
                }


                setIsLibraryStatusLoading(
                    false
                );
            },
            [
                isAuthenticated,
                isRestoring,
                isValidMovieId,
                movieId,
                resetLibraryState,
            ]
        );


    const handleFavoriteToggle =
        useCallback(
            async () => {
                setLibraryActionError(
                    null
                );


                if (
                    !isAuthenticated
                ) {
                    router.push(
                        "/login"
                    );

                    return;
                }


                if (
                    !isValidMovieId ||
                    isFavoritePending ||
                    isLibraryStatusLoading
                ) {
                    return;
                }


                setIsFavoritePending(
                    true
                );


                try {
                    if (
                        isFavorite
                    ) {
                        await removeFavorite(
                            movieId
                        );

                        setIsFavorite(
                            false
                        );
                    } else {
                        await addFavorite(
                            movieId
                        );

                        setIsFavorite(
                            true
                        );
                    }
                } catch (
                    requestError
                ) {
                    setLibraryActionError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );
                } finally {
                    setIsFavoritePending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isFavorite,
                isFavoritePending,
                isLibraryStatusLoading,
                isValidMovieId,
                movieId,
                router,
            ]
        );


    const handleWatchlistToggle =
        useCallback(
            async () => {
                setLibraryActionError(
                    null
                );


                if (
                    !isAuthenticated
                ) {
                    router.push(
                        "/login"
                    );

                    return;
                }


                if (
                    !isValidMovieId ||
                    isWatchlistPending ||
                    isLibraryStatusLoading
                ) {
                    return;
                }


                setIsWatchlistPending(
                    true
                );


                try {
                    if (
                        isWatchlisted
                    ) {
                        await removeFromWatchlist(
                            movieId
                        );

                        setIsWatchlisted(
                            false
                        );
                    } else {
                        await addToWatchlist(
                            movieId
                        );

                        setIsWatchlisted(
                            true
                        );
                    }
                } catch (
                    requestError
                ) {
                    setLibraryActionError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );
                } finally {
                    setIsWatchlistPending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isLibraryStatusLoading,
                isValidMovieId,
                isWatchlisted,
                isWatchlistPending,
                movieId,
                router,
            ]
        );


    return {
        isFavorite,
        isWatchlisted,
        isLibraryStatusLoading,
        isFavoritePending,
        isWatchlistPending,
        libraryActionError,
        loadLibraryStatus,
        handleFavoriteToggle,
        handleWatchlistToggle,
    };
};


export default useMovieLibrary;