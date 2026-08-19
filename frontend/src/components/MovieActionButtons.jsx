import {
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router";

import {
    addFavorite,
    addToWatchlist,
    getFavoriteStatus,
    getWatchlistStatus,
    removeFavorite,
    removeFromWatchlist,
} from "../api/library.api";

import useAuth from "../hooks/useAuth";

import "../styles/library.css";


const fetchMovieLibraryStatus =
    async (
        movieId
    ) => {
        const [
            favoriteResult,
            watchlistResult,
        ] =
            await Promise.allSettled([
                getFavoriteStatus(
                    movieId
                ),

                getWatchlistStatus(
                    movieId
                ),
            ]);


        const unauthorizedResult =
            [
                favoriteResult,
                watchlistResult,
            ].find(
                (result) =>
                    result.status ===
                        "rejected" &&
                    result.reason
                        ?.status ===
                        401
            );


        if (
            unauthorizedResult
        ) {
            throw unauthorizedResult
                .reason;
        }


        return {
            isFavorite:
                favoriteResult.status ===
                "fulfilled"
                    ? Boolean(
                        favoriteResult
                            .value
                            ?.data
                            ?.isFavorite
                    )
                    : false,

            favoriteError:
                favoriteResult.status ===
                "rejected"
                    ? favoriteResult
                        .reason
                        ?.message ||
                    "Favori durumu alınamadı."
                    : "",

            isWatchlisted:
                watchlistResult.status ===
                "fulfilled"
                    ? Boolean(
                        watchlistResult
                            .value
                            ?.data
                            ?.isWatchlisted
                    )
                    : false,

            watchlistError:
                watchlistResult.status ===
                "rejected"
                    ? watchlistResult
                        .reason
                        ?.message ||
                    "İzleme listesi durumu alınamadı."
                    : "",
        };
    };


function MovieActionButtons({
    movieId,
}) {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();


    /*
     * Status bilgisi hem kullanıcıya
     * hem de filme bağlı tutulur.
     */
    const [
        libraryStatus,
        setLibraryStatus,
    ] = useState(null);

    const [
        isFavoriteLoading,
        setIsFavoriteLoading,
    ] = useState(false);

    const [
        isWatchlistLoading,
        setIsWatchlistLoading,
    ] = useState(false);

    const [
        feedback,
        setFeedback,
    ] = useState({
        key: null,
        message: "",
    });

    const [
        actionError,
        setActionError,
    ] = useState({
        key: null,
        message: "",
    });


    const requestKey =
        isAuthenticated &&
        user?.id &&
        movieId
            ? `${user.id}:${movieId}`
            : null;


    const currentStatus =
        requestKey &&
        libraryStatus?.key ===
            requestKey
            ? libraryStatus
            : null;


    const isFavoriteChecking =
        Boolean(
            requestKey
        ) &&
        !currentStatus;


    const isWatchlistChecking =
        Boolean(
            requestKey
        ) &&
        !currentStatus;


    const favoriteStatusError =
        currentStatus
            ?.favoriteError ??
        "";


    const watchlistStatusError =
        currentStatus
            ?.watchlistError ??
        "";


    const isFavorite =
        Boolean(
            currentStatus
                ?.isFavorite
        );


    const isWatchlisted =
        Boolean(
            currentStatus
                ?.isWatchlisted
        );


    const visibleFeedback =
        feedback.key ===
        requestKey
            ? feedback.message
            : "";


    const visibleActionError =
        actionError.key ===
        requestKey
            ? actionError.message
            : "";


    useEffect(() => {
        if (!requestKey) {
            return;
        }


        let cancelled =
            false;

        const currentRequestKey =
            requestKey;


        fetchMovieLibraryStatus(
            movieId
        )
            .then(
                (status) => {
                    if (cancelled) {
                        return;
                    }


                    setLibraryStatus({
                        key:
                            currentRequestKey,

                        isFavorite:
                            status.isFavorite,

                        favoriteError:
                            status.favoriteError,

                        isWatchlisted:
                            status.isWatchlisted,

                        watchlistError:
                            status.watchlistError,
                    });
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (cancelled) {
                        return;
                    }


                    if (
                        requestError.status ===
                        401
                    ) {
                        logout();

                        return;
                    }


                    setLibraryStatus({
                        key:
                            currentRequestKey,

                        isFavorite:
                            false,

                        favoriteError:
                            requestError.message,

                        isWatchlisted:
                            false,

                        watchlistError:
                            requestError.message,
                    });
                }
            );


        return () => {
            cancelled =
                true;
        };
    }, [
        logout,
        movieId,
        requestKey,
    ]);


    const redirectToLogin =
        () => {
            navigate(
                "/login",
                {
                    state: {
                        from:
                            location,
                    },
                }
            );
        };


    const handleUnauthorized =
        () => {
            logout();

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        from:
                            location,

                        message:
                            "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
                    },
                }
            );
        };


    const handleFavorite =
        async () => {
            if (
                !isAuthenticated
            ) {
                redirectToLogin();

                return;
            }


            /*
             * Sadece favori status bilgisi
             * bilinmiyorsa favori action'ı
             * engellenir.
             *
             * Watchlist status hatası favori
             * butonunu etkilemez.
             */
            if (
                !currentStatus ||
                favoriteStatusError
            ) {
                return;
            }


            setIsFavoriteLoading(
                true
            );

            setFeedback({
                key:
                    requestKey,
                message: "",
            });

            setActionError({
                key:
                    requestKey,
                message: "",
            });


            try {
                if (isFavorite) {
                    await removeFavorite(
                        movieId
                    );


                    setLibraryStatus(
                        (
                            previousStatus
                        ) => {
                            if (
                                previousStatus
                                    ?.key !==
                                requestKey
                            ) {
                                return previousStatus;
                            }


                            return {
                                ...previousStatus,

                                isFavorite:
                                    false,
                            };
                        }
                    );


                    setFeedback({
                        key:
                            requestKey,

                        message:
                            "Film favorilerden kaldırıldı.",
                    });
                } else {
                    await addFavorite(
                        movieId
                    );


                    setLibraryStatus(
                        (
                            previousStatus
                        ) => {
                            if (
                                previousStatus
                                    ?.key !==
                                requestKey
                            ) {
                                return previousStatus;
                            }


                            return {
                                ...previousStatus,

                                isFavorite:
                                    true,
                            };
                        }
                    );


                    setFeedback({
                        key:
                            requestKey,

                        message:
                            "Film favorilere eklendi.",
                    });
                }
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setActionError({
                    key:
                        requestKey,

                    message:
                        requestError.message,
                });
            } finally {
                setIsFavoriteLoading(
                    false
                );
            }
        };


    const handleWatchlist =
        async () => {
            if (
                !isAuthenticated
            ) {
                redirectToLogin();

                return;
            }


            /*
             * Favorite status hatası watchlist
             * action'ını engellemez.
             */
            if (
                !currentStatus ||
                watchlistStatusError
            ) {
                return;
            }


            setIsWatchlistLoading(
                true
            );

            setFeedback({
                key:
                    requestKey,
                message: "",
            });

            setActionError({
                key:
                    requestKey,
                message: "",
            });


            try {
                if (
                    isWatchlisted
                ) {
                    await removeFromWatchlist(
                        movieId
                    );


                    setLibraryStatus(
                        (
                            previousStatus
                        ) => {
                            if (
                                previousStatus
                                    ?.key !==
                                requestKey
                            ) {
                                return previousStatus;
                            }


                            return {
                                ...previousStatus,

                                isWatchlisted:
                                    false,
                            };
                        }
                    );


                    setFeedback({
                        key:
                            requestKey,

                        message:
                            "Film izleme listesinden kaldırıldı.",
                    });
                } else {
                    await addToWatchlist(
                        movieId
                    );


                    setLibraryStatus(
                        (
                            previousStatus
                        ) => {
                            if (
                                previousStatus
                                    ?.key !==
                                requestKey
                            ) {
                                return previousStatus;
                            }


                            return {
                                ...previousStatus,

                                isWatchlisted:
                                    true,
                            };
                        }
                    );


                    setFeedback({
                        key:
                            requestKey,

                        message:
                            "Film izleme listesine eklendi.",
                    });
                }
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setActionError({
                    key:
                        requestKey,

                    message:
                        requestError.message,
                });
            } finally {
                setIsWatchlistLoading(
                    false
                );
            }
        };


    return (
        <div className="movie-actions-area">
            <div className="movie-actions">
                <button
                    type="button"
                    className={
                        isFavorite
                            ? "movie-action-button active"
                            : "movie-action-button"
                    }
                    onClick={
                        handleFavorite
                    }
                    disabled={
                        isFavoriteChecking ||
                        Boolean(
                            favoriteStatusError
                        ) ||
                        isFavoriteLoading
                    }
                >
                    <span className="movie-action-icon">
                        {isFavorite
                            ? "♥"
                            : "♡"}
                    </span>

                    {isFavoriteChecking
                        ? "Checking..."
                        : isFavoriteLoading
                            ? "Updating..."
                            : isFavorite
                                ? "Favorited"
                                : "Add to Favorites"}
                </button>

                <button
                    type="button"
                    className={
                        isWatchlisted
                            ? "movie-action-button active"
                            : "movie-action-button"
                    }
                    onClick={
                        handleWatchlist
                    }
                    disabled={
                        isWatchlistChecking ||
                        Boolean(
                            watchlistStatusError
                        ) ||
                        isWatchlistLoading
                    }
                >
                    <span className="movie-action-icon">
                        {isWatchlisted
                            ? "✓"
                            : "+"}
                    </span>

                    {isWatchlistChecking
                        ? "Checking..."
                        : isWatchlistLoading
                            ? "Updating..."
                            : isWatchlisted
                                ? "In Watchlist"
                                : "Add to Watchlist"}
                </button>
            </div>

            {visibleFeedback && (
                <p className="movie-action-feedback">
                    {
                        visibleFeedback
                    }
                </p>
            )}

            {favoriteStatusError && (
                <p className="movie-action-error">
                    Favorites:{" "}
                    {
                        favoriteStatusError
                    }
                </p>
            )}

            {watchlistStatusError && (
                <p className="movie-action-error">
                    Watchlist:{" "}
                    {
                        watchlistStatusError
                    }
                </p>
            )}

            {visibleActionError && (
                <p className="movie-action-error">
                    {
                        visibleActionError
                    }
                </p>
            )}
        </div>
    );
}


export default MovieActionButtons;