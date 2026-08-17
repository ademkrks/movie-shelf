import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router";

import CollectionMovieCard from "./CollectionMovieCard";

import {
    getMovieDetails,
} from "../api/tmdb.api";

import useAuth from "../hooks/useAuth";


const fetchCollectionPage =
    async (
        loadCollection,
        requestedPage
    ) => {
        const response =
            await loadCollection(
                requestedPage,
                20
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
        };


    return (
        <section className="collection-page">
            <div className="collection-header">
                <p className="eyebrow">
                    {eyebrow}
                </p>

                <h1>
                    {title}
                </h1>

                <p>
                    {description}
                </p>
            </div>

            {error && (
                <div className="form-error collection-message">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="collection-loading">
                    Loading movies...
                </div>
            ) : movies.length ===
                0 ? (
                <div className="collection-empty">
                    <div>
                        <h2>
                            Nothing here yet
                        </h2>

                        <p>
                            {emptyMessage}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="collection-grid">
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

                    {pagination && (
                        <div className="collection-pagination">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    !pagination
                                        .hasPreviousPage
                                }
                            >
                                Previous
                            </button>

                            <div className="pagination-info">
                                <strong>
                                    Page{" "}
                                    {
                                        pagination.page
                                    }
                                </strong>

                                <span>
                                    {pagination.totalPages >
                                    0
                                        ? ` of ${pagination.totalPages}`
                                        : ""}
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
                                        .hasNextPage
                                }
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}


export default CollectionPage;