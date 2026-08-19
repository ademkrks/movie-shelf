import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router";

import CollectionMovieCard from "./CollectionMovieCard";

import {
    getMovieDetails,
} from "../api/tmdb.api";

import useAuth from "../hooks/useAuth";


const COLLECTION_PAGE_SIZE = 20;


const fetchCollectionPage =
    async (
        loadCollection,
        requestedPage
    ) => {
        const response =
            await loadCollection(
                requestedPage,
                COLLECTION_PAGE_SIZE
            );


        const collectionData =
            response.data;


        const items =
            collectionData?.items ||
            [];


        const movieDetails =
            await Promise.all(
                items.map(
                    async (
                        item
                    ) => {
                        try {
                            const movieResponse =
                                await getMovieDetails(
                                    item.tmdbMovieId
                                );


                            return {
                                ...movieResponse.data,

                                collectionCreatedAt:
                                    item.createdAt,
                            };
                        } catch {
                            return null;
                        }
                    }
                )
            );


        return {
            movies:
                movieDetails.filter(
                    Boolean
                ),

            pagination:
                collectionData
                    ?.pagination ||
                null,
        };
    };


function CollectionSkeletonCard() {
    return (
        <div
            className="collection-skeleton-card"
            aria-hidden="true"
        >
            <div className="collection-skeleton-poster" />

            <div className="collection-skeleton-title" />

            <div className="collection-skeleton-meta" />

            <div className="collection-skeleton-button" />
        </div>
    );
}


function CollectionLoading() {
    return (
        <div
            className="collection-loading"
            aria-label="Loading movies"
            aria-busy="true"
        >
            <div className="collection-grid">
                {Array.from({
                    length: 10,
                }).map(
                    (
                        _,
                        index
                    ) => (
                        <CollectionSkeletonCard
                            key={
                                index
                            }
                        />
                    )
                )}
            </div>
        </div>
    );
}


function CollectionPage({
    eyebrow,
    title,
    description,
    emptyMessage,
    removeLabel,
    loadCollection,
    removeMovie,
}) {
    const navigate =
        useNavigate();

    const {
        logout,
    } = useAuth();


    const [
        movies,
        setMovies,
    ] = useState([]);

    const [
        pagination,
        setPagination,
    ] = useState(null);

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        removingMovieId,
        setRemovingMovieId,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState("");


    const isFavoritesCollection =
        eyebrow
            .toLowerCase()
            .includes(
                "favorite"
            );


    const totalItems =
        pagination
            ?.totalItems ??
        0;


    const currentPage =
        pagination
            ?.page ??
        page;


    const totalPages =
        pagination
            ?.totalPages ??
        0;


    const handleUnauthorized =
        useCallback(() => {
            logout();

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        message:
                            "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
                    },
                }
            );
        }, [
            logout,
            navigate,
        ]);


    useEffect(() => {
        let cancelled =
            false;


        fetchCollectionPage(
            loadCollection,
            page
        )
            .then(
                (result) => {
                    if (
                        cancelled
                    ) {
                        return;
                    }


                    setMovies(
                        result.movies
                    );

                    setPagination(
                        result.pagination
                    );

                    setError("");
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (
                        cancelled
                    ) {
                        return;
                    }


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
                }
            )
            .finally(
                () => {
                    if (
                        !cancelled
                    ) {
                        setIsLoading(
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
        handleUnauthorized,
        loadCollection,
        page,
    ]);


    const reloadPage =
        async (
            requestedPage
        ) => {
            setIsLoading(
                true
            );

            setError("");


            try {
                const result =
                    await fetchCollectionPage(
                        loadCollection,
                        requestedPage
                    );


                setMovies(
                    result.movies
                );

                setPagination(
                    result.pagination
                );
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
                setIsLoading(
                    false
                );
            }
        };


    const handleRemove =
        async (
            movieId
        ) => {
            setRemovingMovieId(
                movieId
            );

            setError("");


            try {
                await removeMovie(
                    movieId
                );


                const isLastItem =
                    movies.length ===
                    1;


                if (
                    isLastItem &&
                    page > 1
                ) {
                    setIsLoading(
                        true
                    );

                    setPage(
                        (current) =>
                            current - 1
                    );
                } else {
                    await reloadPage(
                        page
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
                setRemovingMovieId(
                    null
                );
            }
        };


    const goToPreviousPage =
        () => {
            if (
                !pagination
                    ?.hasPreviousPage
            ) {
                return;
            }


            setError("");

            setIsLoading(
                true
            );

            setPage(
                (current) =>
                    current - 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        };


    const goToNextPage =
        () => {
            if (
                !pagination
                    ?.hasNextPage
            ) {
                return;
            }


            setError("");

            setIsLoading(
                true
            );

            setPage(
                (current) =>
                    current + 1
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        };


    return (
        <section className="collection-page">
            <div
                className="collection-page-glow"
                aria-hidden="true"
            />

            <header className="collection-header">
                <div className="collection-header-copy">
                    <div className="collection-status">
                        <span
                            className="collection-status-icon"
                            aria-hidden="true"
                        >
                            {isFavoritesCollection
                                ? "♥"
                                : "＋"}
                        </span>

                        <span>
                            Personal Collection
                        </span>
                    </div>

                    <p className="eyebrow">
                        {eyebrow}
                    </p>

                    <h1>
                        {title}
                    </h1>

                    <p className="collection-description">
                        {description}
                    </p>

                    <Link
                        to="/"
                        className="collection-discover-link"
                    >
                        Discover movies

                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>
                </div>

                <div className="collection-overview">
                    <div className="collection-overview-card">
                        <span>
                            Movies
                        </span>

                        <strong>
                            {isLoading
                                ? "—"
                                : totalItems}
                        </strong>

                        <small>
                            in this collection
                        </small>
                    </div>

                    <div className="collection-overview-card">
                        <span>
                            Page
                        </span>

                        <strong>
                            {isLoading
                                ? "—"
                                : currentPage}
                        </strong>

                        <small>
                            {totalPages > 0
                                ? `of ${totalPages}`
                                : "of 1"}
                        </small>
                    </div>
                </div>
            </header>

            {error && (
                <div
                    className="form-error collection-message"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {isLoading ? (
                <CollectionLoading />
            ) : movies.length ===
                0 ? (
                <div className="collection-empty">
                    <div className="collection-empty-content">
                        <div
                            className="collection-empty-icon"
                            aria-hidden="true"
                        >
                            {isFavoritesCollection
                                ? "♡"
                                : "＋"}
                        </div>

                        <p className="eyebrow">
                            EMPTY COLLECTION
                        </p>

                        <h2>
                            {isFavoritesCollection
                                ? "No favorites yet"
                                : "Your watchlist is empty"}
                        </h2>

                        <p>
                            {emptyMessage}
                        </p>

                        <Link
                            to="/"
                            className="primary-button collection-empty-button"
                        >
                            Discover Movies
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="collection-content-heading">
                        <div>
                            <p className="collection-content-label">
                                YOUR MOVIES
                            </p>

                            <h2>
                                Saved to MovieShelf
                            </h2>
                        </div>

                        <span>
                            {totalItems}{" "}
                            {totalItems === 1
                                ? "movie"
                                : "movies"}
                        </span>
                    </div>

                    <div
                        className="collection-grid"
                        aria-busy={
                            Boolean(
                                removingMovieId
                            )
                        }
                    >
                        {movies.map(
                            (movie) => (
                                <CollectionMovieCard
                                    key={
                                        movie.id
                                    }
                                    movie={
                                        movie
                                    }
                                    removeLabel={
                                        removeLabel
                                    }
                                    isRemoving={
                                        removingMovieId ===
                                        movie.id
                                    }
                                    onRemove={() =>
                                        handleRemove(
                                            movie.id
                                        )
                                    }
                                />
                            )
                        )}
                    </div>

                    {pagination &&
                        pagination.totalPages >
                            1 && (
                        <nav
                            className="collection-pagination"
                            aria-label="Collection pages"
                        >
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    !pagination
                                        .hasPreviousPage ||
                                    Boolean(
                                        removingMovieId
                                    )
                                }
                            >
                                <span aria-hidden="true">
                                    ←
                                </span>

                                Previous
                            </button>

                            <div
                                className="pagination-info"
                                aria-live="polite"
                            >
                                <strong>
                                    {
                                        pagination.page
                                    }
                                </strong>

                                <span>
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <small>
                                    {
                                        pagination.totalItems
                                    }{" "}
                                    movies
                                </small>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    !pagination
                                        .hasNextPage ||
                                    Boolean(
                                        removingMovieId
                                    )
                                }
                            >
                                Next

                                <span aria-hidden="true">
                                    →
                                </span>
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    );
}


export default CollectionPage;