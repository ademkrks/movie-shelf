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
            favoriteResponse,
            watchlistResponse,
        ] =
            await Promise.all([
                getFavoriteStatus(
                    movieId
                ),

                getWatchlistStatus(
                    movieId
                ),
            ]);


        return {
            isFavorite:
                Boolean(
                    favoriteResponse
                        ?.data
                        ?.isFavorite
                ),

            isWatchlisted:
                Boolean(
                    watchlistResponse
                        ?.data
                        ?.isWatchlisted
                ),
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
     *
     * Böylece farklı filme veya farklı
     * kullanıcıya geçildiğinde eski durum
     * yanlışlıkla kullanılamaz.
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


    /*
     * Yalnızca mevcut kullanıcı ve filme
     * ait status bilgisi kullanılabilir.
     */
    const currentStatus =
        requestKey &&
        libraryStatus?.key ===
            requestKey
            ? libraryStatus
            : null;


    /*
     * Status henüz gelmediyse butonlar
     * kullanıma açılmaz.
     */
    const isChecking =
        Boolean(
            requestKey
        ) &&
        !currentStatus;


    const statusError =
        currentStatus?.error ??
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

                        isWatchlisted:
                            status.isWatchlisted,

                        error: "",
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


                    /*
                     * Status belirlenememişse
                     * action butonları açılmaz.
                     *
                     * Böylece bilinmeyen durumda
                     * yanlış POST/DELETE isteği
                     * gönderilmez.
                     */
                    setLibraryStatus({
                        key:
                            currentRequestKey,

                        isFavorite:
                            false,

                        isWatchlisted:
                            false,

                        error:
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
             * Status henüz bilinmiyorsa
             * veya status isteği başarısızsa
             * action gönderilmez.
             */
            if (
                !currentStatus ||
                statusError
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


            if (
                !currentStatus ||
                statusError
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
                        isChecking ||
                        Boolean(
                            statusError
                        ) ||
                        isFavoriteLoading
                    }
                >
                    <span className="movie-action-icon">
                        {isFavorite
                            ? "♥"
                            : "♡"}
                    </span>

                    {isChecking
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
                        isChecking ||
                        Boolean(
                            statusError
                        ) ||
                        isWatchlistLoading
                    }
                >
                    <span className="movie-action-icon">
                        {isWatchlisted
                            ? "✓"
                            : "+"}
                    </span>

                    {isChecking
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

            {(statusError ||
                visibleActionError) && (
                <p className="movie-action-error">
                    {statusError ||
                        visibleActionError}
                </p>
            )}
        </div>
    );
}


export default MovieActionButtons;