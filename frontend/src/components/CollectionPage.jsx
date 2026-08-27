import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router";

import CollectionMovieCard from "./CollectionMovieCard";

import {
    getMovieDetailsBatch,
} from "../api/tmdb.api";

import useAuth from "../hooks/useAuth";


const COLLECTION_PAGE_SIZE =
    20;


const getScrollBehavior =
    () => {
        const prefersReducedMotion =
            window.matchMedia?.(
                "(prefers-reduced-motion: reduce)"
            )
                .matches;


        return prefersReducedMotion
            ? "auto"
            : "smooth";
    };


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


        if (
            items.length ===
            0
        ) {
            return {
                movies: [],

                pagination:
                    collectionData
                        ?.pagination ||
                    null,

                hydrationWarning:
                    "",
            };
        }


        const movieIds =
            items.map(
                (
                    item
                ) =>
                    Number(
                        item.tmdbMovieId
                    )
            );


        const movieResponse =
            await getMovieDetailsBatch(
                movieIds
            );


        const movieDetails =
            movieResponse.data
                ?.items ||
            [];


        const failedMovieIds =
            movieResponse.data
                ?.failedMovieIds ||
            [];


        const moviesById =
            new Map(
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


        const unavailableMovieIds =
            new Set(
                failedMovieIds.map(
                    (
                        movieId
                    ) =>
                        Number(
                            movieId
                        )
                )
            );


        const movies =
            items
                .map(
                    (
                        item
                    ) => {
                        const tmdbMovieId =
                            Number(
                                item.tmdbMovieId
                            );


                        const movie =
                            moviesById.get(
                                tmdbMovieId
                            );


                        if (!movie) {
                            unavailableMovieIds
                                .add(
                                    tmdbMovieId
                                );


                            return null;
                        }


                        return {
                            ...movie,

                            collectionCreatedAt:
                                item.createdAt,
                        };
                    }
                )
                .filter(
                    Boolean
                );


        const unavailableCount =
            unavailableMovieIds.size;


        let hydrationWarning =
            "";


        if (
            unavailableCount ===
            1
        ) {
            hydrationWarning =
                "Kaydedilmiş 1 film TMDB'den yüklenemedi.";
        } else if (
            unavailableCount >
            1
        ) {
            hydrationWarning =
                `${unavailableCount} kaydedilmiş film TMDB'den yüklenemedi.`;
        }


        return {
            movies,

            pagination:
                collectionData
                    ?.pagination ||
                null,

            hydrationWarning,
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
            aria-label="Filmler yükleniyor"
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
        loadError,
        setLoadError,
    ] = useState("");

    const [
        actionError,
        setActionError,
    ] = useState("");

    const [
        hydrationWarning,
        setHydrationWarning,
    ] = useState("");


    const requestIdRef =
        useRef(0);

    const mountedRef =
        useRef(true);


    const normalizedEyebrow =
        eyebrow.toLocaleLowerCase(
            "tr-TR"
        );


    const isFavoritesCollection =
        normalizedEyebrow.includes(
            "favorite"
        ) ||
        normalizedEyebrow.includes(
            "favori"
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
        mountedRef.current =
            true;


        return () => {
            mountedRef.current =
                false;
        };
    }, []);


    useEffect(() => {
        const requestId =
            requestIdRef.current +
            1;


        requestIdRef.current =
            requestId;


        let cancelled =
            false;


        fetchCollectionPage(
            loadCollection,
            1
        )
            .then(
                (
                    result
                ) => {
                    if (
                        cancelled ||
                        requestId !==
                            requestIdRef
                                .current
                    ) {
                        return;
                    }


                    setMovies(
                        result.movies
                    );

                    setPagination(
                        result.pagination
                    );

                    setPage(
                        result.pagination
                            ?.page ??
                        1
                    );

                    setLoadError("");

                    setActionError("");

                    setHydrationWarning(
                        result
                            .hydrationWarning
                    );
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (
                        cancelled ||
                        requestId !==
                            requestIdRef
                                .current
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


                    setMovies([]);

                    setPagination(null);

                    setPage(1);

                    setHydrationWarning("");

                    setLoadError(
                        requestError
                            .message ||
                            "Koleksiyon yüklenemedi."
                    );
                }
            )
            .finally(
                () => {
                    if (
                        !cancelled &&
                        requestId ===
                            requestIdRef
                                .current
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


            if (
                requestIdRef.current ===
                requestId
            ) {
                requestIdRef.current +=
                    1;
            }
        };
    }, [
        handleUnauthorized,
        loadCollection,
    ]);


    const reloadPage =
        async (
            requestedPage
        ) => {
            const requestId =
                requestIdRef.current +
                1;


            requestIdRef.current =
                requestId;


            setIsLoading(true);

            setLoadError("");

            setActionError("");


            try {
                const result =
                    await fetchCollectionPage(
                        loadCollection,
                        requestedPage
                    );


                if (
                    !mountedRef.current ||
                    requestId !==
                        requestIdRef
                            .current
                ) {
                    return false;
                }


                setMovies(
                    result.movies
                );

                setPagination(
                    result.pagination
                );

                setPage(
                    result.pagination
                        ?.page ??
                    requestedPage
                );

                setHydrationWarning(
                    result
                        .hydrationWarning
                );

                setLoadError("");


                return true;
            } catch (
                requestError
            ) {
                if (
                    !mountedRef.current ||
                    requestId !==
                        requestIdRef
                            .current
                ) {
                    return false;
                }


                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return false;
                }


                /*
                 * Pagination veya refresh hatasında
                 * son başarılı film listesi korunur.
                 */
                setLoadError(
                    requestError
                        .message ||
                        "Koleksiyon yenilenemedi."
                );


                return false;
            } finally {
                if (
                    mountedRef.current &&
                    requestId ===
                        requestIdRef
                            .current
                ) {
                    setIsLoading(
                        false
                    );
                }
            }
        };


    const handleRemove =
        async (
            movieId
        ) => {
            setRemovingMovieId(
                movieId
            );

            setActionError("");


            try {
                await removeMovie(
                    movieId
                );


                const isLastItem =
                    movies.length ===
                    1;


                const targetPage =
                    isLastItem &&
                    page > 1
                        ? page - 1
                        : page;


                await reloadPage(
                    targetPage
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


                setActionError(
                    requestError
                        .message ||
                        "Film kaldırılamadı."
                );
            } finally {
                setRemovingMovieId(
                    null
                );
            }
        };


    const goToPreviousPage =
        async () => {
            if (
                !pagination
                    ?.hasPreviousPage ||
                isLoading ||
                removingMovieId
            ) {
                return;
            }


            const succeeded =
                await reloadPage(
                    page - 1
                );


            if (succeeded) {
                window.scrollTo({
                    top: 0,

                    behavior:
                        getScrollBehavior(),
                });
            }
        };


    const goToNextPage =
        async () => {
            if (
                !pagination
                    ?.hasNextPage ||
                isLoading ||
                removingMovieId
            ) {
                return;
            }


            const succeeded =
                await reloadPage(
                    page + 1
                );


            if (succeeded) {
                window.scrollTo({
                    top: 0,

                    behavior:
                        getScrollBehavior(),
                });
            }
        };


    const retryCurrentPage =
        async () => {
            await reloadPage(
                page
            );
        };


    const hasInitialLoadFailure =
        Boolean(
            loadError
        ) &&
        movies.length ===
            0 &&
        !pagination;


    const hasUnavailableSavedMovies =
        Boolean(
            hydrationWarning
        ) &&
        movies.length ===
            0 &&
        totalItems >
            0;


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
                                : "+"}
                        </span>

                        <span>
                            Kişisel Koleksiyon
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
                        Filmleri Keşfet

                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>
                </div>

                <div className="collection-overview">
                    <div className="collection-overview-card">
                        <span>
                            Filmler
                        </span>

                        <strong>
                            {isLoading &&
                            !pagination
                                ? "—"
                                : totalItems}
                        </strong>

                        <small>
                            bu koleksiyonda
                        </small>
                    </div>

                    <div className="collection-overview-card">
                        <span>
                            Sayfa
                        </span>

                        <strong>
                            {isLoading &&
                            !pagination
                                ? "—"
                                : currentPage}
                        </strong>

                        <small>
                            {totalPages > 0
                                ? `toplam ${totalPages}`
                                : "toplam 1"}
                        </small>
                    </div>
                </div>
            </header>

            {actionError && (
                <div
                    className="form-error collection-message"
                    role="alert"
                >
                    {actionError}
                </div>
            )}

            {loadError &&
                !hasInitialLoadFailure && (
                <div
                    className="form-error collection-message"
                    role="alert"
                >
                    <span>
                        {loadError}
                    </span>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            retryCurrentPage
                        }
                        disabled={
                            isLoading
                        }
                    >
                        {isLoading
                            ? "Tekrar deneniyor..."
                            : "Tekrar Dene"}
                    </button>
                </div>
            )}

            {hydrationWarning &&
                movies.length >
                    0 && (
                <div
                    className="form-error collection-message"
                    role="status"
                >
                    <span>
                        {
                            hydrationWarning
                        }
                    </span>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            retryCurrentPage
                        }
                        disabled={
                            isLoading
                        }
                    >
                        Eksik Filmleri Tekrar Dene
                    </button>
                </div>
            )}

            {isLoading &&
            movies.length ===
                0 ? (
                <CollectionLoading />
            ) : hasInitialLoadFailure ? (
                <div className="collection-empty">
                    <div className="collection-empty-content">
                        <div
                            className="collection-empty-icon"
                            aria-hidden="true"
                        >
                            !
                        </div>

                        <p className="eyebrow">
                            KOLEKSİYON KULLANILAMIYOR
                        </p>

                        <h2>
                            Filmler yüklenemedi
                        </h2>

                        <p>
                            {loadError}
                        </p>

                        <button
                            type="button"
                            className="primary-button collection-empty-button"
                            onClick={
                                retryCurrentPage
                            }
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            ) : hasUnavailableSavedMovies ? (
                <div className="collection-empty">
                    <div className="collection-empty-content">
                        <div
                            className="collection-empty-icon"
                            aria-hidden="true"
                        >
                            !
                        </div>

                        <p className="eyebrow">
                            FİLMLER KULLANILAMIYOR
                        </p>

                        <h2>
                            Kaydedilen filmler görüntülenemedi
                        </h2>

                        <p>
                            {
                                hydrationWarning
                            }
                        </p>

                        <button
                            type="button"
                            className="primary-button collection-empty-button"
                            onClick={
                                retryCurrentPage
                            }
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
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
                                : "+"}
                        </div>

                        <p className="eyebrow">
                            BOŞ KOLEKSİYON
                        </p>

                        <h2>
                            {isFavoritesCollection
                                ? "Henüz favori yok"
                                : "İzleme listen boş"}
                        </h2>

                        <p>
                            {emptyMessage}
                        </p>

                        <Link
                            to="/"
                            className="primary-button collection-empty-button"
                        >
                            Filmleri Keşfet
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="collection-content-heading">
                        <div>
                            <p className="collection-content-label">
                                FİLMLERİN
                            </p>

                            <h2>
                                MovieShelf&apos;e Kaydettiklerin
                            </h2>
                        </div>

                        <span>
                            {totalItems}{" "}
                            film
                        </span>
                    </div>

                    <div
                        className="collection-grid"
                        aria-busy={
                            Boolean(
                                removingMovieId
                            ) ||
                            isLoading
                        }
                    >
                        {movies.map(
                            (
                                movie
                            ) => (
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
                            aria-label="Koleksiyon sayfaları"
                        >
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    isLoading ||
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

                                Önceki
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
                                    /{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <small>
                                    {
                                        pagination.totalItems
                                    }{" "}
                                    film
                                </small>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    isLoading ||
                                    !pagination
                                        .hasNextPage ||
                                    Boolean(
                                        removingMovieId
                                    )
                                }
                            >
                                Sonraki

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