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
    getAllFavorites,
    getAllWatchlist,
    removeFavorite,
    removeFromWatchlist,
} from "../api/library.api";

import useAuth from "../hooks/useAuth";

import "../styles/library.css";


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
    ] = useState(
        isAuthenticated
    );

    const [
        favoriteLoading,
        setFavoriteLoading,
    ] = useState(false);

    const [
        watchlistLoading,
        setWatchlistLoading,
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
        let cancelled = false;


        const checkCollections =
            async () => {
                if (
                    !isAuthenticated
                ) {
                    setIsFavorite(
                        false
                    );

                    setIsWatchlisted(
                        false
                    );

                    setIsChecking(
                        false
                    );

                    return;
                }


                setIsChecking(true);


                try {
                    const [
                        favorites,
                        watchlist,
                    ] =
                        await Promise.all([
                            getAllFavorites(),
                            getAllWatchlist(),
                        ]);


                    if (cancelled) {
                        return;
                    }


                    const normalizedId =
                        Number(
                            movieId
                        );


                    setIsFavorite(
                        favorites.some(
                            (item) =>
                                Number(
                                    item.tmdbMovieId
                                ) ===
                                normalizedId
                        )
                    );


                    setIsWatchlisted(
                        watchlist.some(
                            (item) =>
                                Number(
                                    item.tmdbMovieId
                                ) ===
                                normalizedId
                        )
                    );
                } catch (
                    requestError
                ) {
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
                } finally {
                    if (!cancelled) {
                        setIsChecking(
                            false
                        );
                    }
                }
            };


        checkCollections();


        return () => {
            cancelled = true;
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


            setError("");
            setFeedback("");
            setFavoriteLoading(
                true
            );


            try {
                if (isFavorite) {
                    await removeFavorite(
                        movieId
                    );

                    setIsFavorite(
                        false
                    );

                    setFeedback(
                        "Removed from favorites."
                    );
                } else {
                    await addFavorite(
                        movieId
                    );

                    setIsFavorite(
                        true
                    );

                    setFeedback(
                        "Added to favorites."
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
                setFavoriteLoading(
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


            setError("");
            setFeedback("");
            setWatchlistLoading(
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

                    setFeedback(
                        "Removed from watchlist."
                    );
                } else {
                    await addToWatchlist(
                        movieId
                    );

                    setIsWatchlisted(
                        true
                    );

                    setFeedback(
                        "Added to watchlist."
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
                setWatchlistLoading(
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
                        favoriteLoading
                    }
                    aria-pressed={
                        isFavorite
                    }
                >
                    <span className="movie-action-icon">
                        {isFavorite
                            ? "♥"
                            : "♡"}
                    </span>

                    {favoriteLoading
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
                        watchlistLoading
                    }
                    aria-pressed={
                        isWatchlisted
                    }
                >
                    <span className="movie-action-icon">
                        {isWatchlisted
                            ? "✓"
                            : "+"}
                    </span>

                    {watchlistLoading
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