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
        isAuthenticated,
        logout,
    } = useAuth();


    const [
        isFavorite,
        setIsFavorite,
    ] = useState(false);

    const [
        isWatchlisted,
        setIsWatchlisted,
    ] = useState(false);

    const [
        isChecking,
        setIsChecking,
    ] = useState(false);

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
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {
        if (
            !isAuthenticated ||
            !movieId
        ) {
            return;
        }


        let cancelled =
            false;


        fetchMovieLibraryStatus(
            movieId
        )
            .then(
                (status) => {
                    if (cancelled) {
                        return;
                    }


                    setIsFavorite(
                        status.isFavorite
                    );

                    setIsWatchlisted(
                        status.isWatchlisted
                    );
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


                    setError(
                        requestError.message
                    );
                }
            )
            .finally(
                () => {
                    if (!cancelled) {
                        setIsChecking(
                            false
                        );
                    }
                }
            );


        return () => {
            cancelled =
                true;
        };
    }, [
        isAuthenticated,
        logout,
        movieId,
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


            setIsFavoriteLoading(
                true
            );

            setFeedback("");
            setError("");


            try {
                if (isFavorite) {
                    await removeFavorite(
                        movieId
                    );

                    setIsFavorite(
                        false
                    );

                    setFeedback(
                        "Film favorilerden kaldırıldı."
                    );
                } else {
                    await addFavorite(
                        movieId
                    );

                    setIsFavorite(
                        true
                    );

                    setFeedback(
                        "Film favorilere eklendi."
                    );
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


                setError(
                    requestError.message
                );
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


            setIsWatchlistLoading(
                true
            );

            setFeedback("");
            setError("");


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

                    setFeedback(
                        "Film izleme listesinden kaldırıldı."
                    );
                } else {
                    await addToWatchlist(
                        movieId
                    );

                    setIsWatchlisted(
                        true
                    );

                    setFeedback(
                        "Film izleme listesine eklendi."
                    );
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


                setError(
                    requestError.message
                );
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
                        isFavoriteLoading
                    }
                >
                    <span className="movie-action-icon">
                        {isFavorite
                            ? "♥"
                            : "♡"}
                    </span>

                    {isFavoriteLoading
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
                        isWatchlistLoading
                    }
                >
                    <span className="movie-action-icon">
                        {isWatchlisted
                            ? "✓"
                            : "+"}
                    </span>

                    {isWatchlistLoading
                        ? "Updating..."
                        : isWatchlisted
                            ? "In Watchlist"
                            : "Add to Watchlist"}
                </button>
            </div>

            {feedback && (
                <p className="movie-action-feedback">
                    {feedback}
                </p>
            )}

            {error && (
                <p className="movie-action-error">
                    {error}
                </p>
            )}
        </div>
    );
}


export default MovieActionButtons;