import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router";

import MovieCard from "../components/MovieCard";

import {
    getPopularMovies,
    getTopRatedMovies,
    getTrendingMovies,
    getUpcomingMovies,
    searchMovies,
} from "../api/tmdb.api";

import "../styles/search-pagination.css";


const POSTER_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


const EMPTY_SEARCH_PAGINATION = {
    page: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
};


function MovieSkeleton() {
    return (
        <div
            className="movie-card-skeleton"
            aria-hidden="true"
        >
            <div className="movie-poster-skeleton" />

            <div className="movie-title-skeleton" />

            <div className="movie-meta-skeleton" />
        </div>
    );
}


function MovieGridSkeleton() {
    return (
        <div className="movie-grid movie-grid-skeleton">
            {Array.from({
                length: 10,
            }).map(
                (_, index) => (
                    <MovieSkeleton
                        key={
                            index
                        }
                    />
                )
            )}
        </div>
    );
}


function DiscoverySkeleton() {
    return (
        <section
            className="discovery-loading"
            aria-label="Loading movies"
            aria-busy="true"
        >
            <div className="section-heading">
                <div>
                    <p className="section-kicker">
                        DISCOVER
                    </p>

                    <h2>
                        Loading movies
                    </h2>

                    <p>
                        Building your
                        MovieShelf discovery
                        feed.
                    </p>
                </div>
            </div>

            <MovieGridSkeleton />
        </section>
    );
}


function MovieSection({
    kicker,
    title,
    subtitle,
    movies,
}) {
    return (
        <section className="movie-section">
            <div className="section-heading">
                <div>
                    <p className="section-kicker">
                        {kicker}
                    </p>

                    <h2>
                        {title}
                    </h2>

                    {subtitle && (
                        <p>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="movie-grid">
                {movies.map(
                    (movie) => (
                        <MovieCard
                            key={
                                movie.id
                            }
                            movie={
                                movie
                            }
                        />
                    )
                )}
            </div>
        </section>
    );
}


function HeroShowcase({
    movies,
    isLoading,
}) {
    const featuredMovies =
        movies
            .filter(
                (movie) =>
                    movie.poster_path
            )
            .slice(
                0,
                3
            );


    return (
        <div
            className="hero-showcase"
            aria-hidden={
                isLoading
            }
        >
            <div className="hero-showcase-glow" />

            {isLoading ? (
                <>
                    <div className="hero-poster hero-poster-skeleton hero-poster-one" />
                    <div className="hero-poster hero-poster-skeleton hero-poster-two" />
                    <div className="hero-poster hero-poster-skeleton hero-poster-three" />
                </>
            ) : (
                featuredMovies.map(
                    (
                        movie,
                        index
                    ) => {
                        const positionClass =
                            [
                                "hero-poster-one",
                                "hero-poster-two",
                                "hero-poster-three",
                            ][index];


                        return (
                            <Link
                                key={
                                    movie.id
                                }
                                to={`/movie/${movie.id}`}
                                className={`hero-poster ${positionClass}`}
                                tabIndex={
                                    -1
                                }
                            >
                                <img
                                    src={
                                        POSTER_BASE_URL +
                                        movie.poster_path
                                    }
                                    alt=""
                                    loading={
                                        index ===
                                        0
                                            ? "eager"
                                            : "lazy"
                                    }
                                />

                                <div className="hero-poster-overlay">
                                    <span>
                                        {
                                            movie.title
                                        }
                                    </span>
                                </div>
                            </Link>
                        );
                    }
                )
            )}
        </div>
    );
}


function HomePage() {
    const [
        trendingMovies,
        setTrendingMovies,
    ] = useState([]);

    const [
        popularMovies,
        setPopularMovies,
    ] = useState([]);

    const [
        topRatedMovies,
        setTopRatedMovies,
    ] = useState([]);

    const [
        upcomingMovies,
        setUpcomingMovies,
    ] = useState([]);

    const [
        searchResults,
        setSearchResults,
    ] = useState([]);

    const [
        searchPagination,
        setSearchPagination,
    ] = useState(
        EMPTY_SEARCH_PAGINATION
    );

    const [
        searchQuery,
        setSearchQuery,
    ] = useState("");

    const [
        activeSearch,
        setActiveSearch,
    ] = useState("");

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSearching,
        setIsSearching,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {
        const loadMovies =
            async () => {
                try {
                    const [
                        trendingResponse,
                        popularResponse,
                        topRatedResponse,
                        upcomingResponse,
                    ] =
                        await Promise.all([
                            getTrendingMovies(),
                            getPopularMovies(),
                            getTopRatedMovies(),
                            getUpcomingMovies(),
                        ]);


                    setTrendingMovies(
                        trendingResponse.data ||
                        []
                    );

                    setPopularMovies(
                        popularResponse.data ||
                        []
                    );

                    setTopRatedMovies(
                        topRatedResponse.data ||
                        []
                    );

                    setUpcomingMovies(
                        upcomingResponse.data ||
                        []
                    );
                } catch (
                    requestError
                ) {
                    setError(
                        requestError.message
                    );
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };


        loadMovies();
    }, []);


    const performSearch =
        async (
            query,
            page
        ) => {
            setError("");
            setIsSearching(true);


            try {
                const response =
                    await searchMovies(
                        query,
                        page
                    );


                const result =
                    response.data ||
                    {};


                setSearchResults(
                    result.items ||
                    []
                );

                setSearchPagination(
                    result.pagination ||
                    EMPTY_SEARCH_PAGINATION
                );

                setActiveSearch(
                    query
                );


                return true;
            } catch (
                requestError
            ) {
                setError(
                    requestError.message
                );


                return false;
            } finally {
                setIsSearching(
                    false
                );
            }
        };


    const handleSearch =
        async (event) => {
            event.preventDefault();

            const query =
                searchQuery.trim();


            if (!query) {
                return;
            }


            await performSearch(
                query,
                1
            );
        };


    const handlePageChange =
        async (page) => {
            if (
                isSearching ||
                !activeSearch
            ) {
                return;
            }


            if (
                page < 1 ||
                page >
                    searchPagination
                        .totalPages
            ) {
                return;
            }


            const searchSucceeded =
                await performSearch(
                    activeSearch,
                    page
                );


            if (
                searchSucceeded
            ) {
                document
                    .getElementById(
                        "search-results"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start",
                    });
            }
        };


    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);

        setSearchPagination(
            EMPTY_SEARCH_PAGINATION
        );

        setActiveSearch("");
        setError("");
    };


    return (
        <div className="movies-page">
            <section className="movies-hero">
                <div className="movies-hero-orb movies-hero-orb-one" />
                <div className="movies-hero-orb movies-hero-orb-two" />

                <div className="movies-hero-inner">
                    <div className="movies-hero-content">
                        <div className="hero-status">
                            <span className="hero-status-dot" />

                            Live movie discovery
                        </div>

                        <p className="eyebrow">
                            YOUR PERSONAL MOVIE SPACE
                        </p>

                        <h1>
                            Find something
                            worth{" "}
                            <span>
                                watching.
                            </span>
                        </h1>

                        <p className="movies-hero-description">
                            Discover what&apos;s
                            trending, explore
                            acclaimed movies and
                            build a collection
                            that feels like your
                            own.
                        </p>

                        <form
                            className="movie-search-form"
                            onSubmit={
                                handleSearch
                            }
                            role="search"
                        >
                            <div className="movie-search-input">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <input
                                    type="search"
                                    value={
                                        searchQuery
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearchQuery(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search for a movie..."
                                    aria-label="Search movies"
                                    minLength={
                                        2
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="primary-button movie-search-button"
                                disabled={
                                    isSearching
                                }
                            >
                                {isSearching
                                    ? "Searching..."
                                    : "Search"}
                            </button>
                        </form>

                        <div className="hero-discovery-tags">
                            <span>
                                Trending
                            </span>

                            <span>
                                Popular
                            </span>

                            <span>
                                Top Rated
                            </span>

                            <span>
                                Upcoming
                            </span>
                        </div>
                    </div>

                    <HeroShowcase
                        movies={
                            trendingMovies
                        }
                        isLoading={
                            isLoading
                        }
                    />
                </div>
            </section>

            <div
                id="discover-content"
                className="movie-content"
            >
                {error && (
                    <div
                        className="form-error movie-page-message"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <DiscoverySkeleton />
                ) : activeSearch ? (
                    <section
                        id="search-results"
                        className="search-results-section"
                        aria-busy={
                            isSearching
                        }
                    >
                        <div className="search-result-heading">
                            <div>
                                <p className="section-kicker">
                                    SEARCH RESULTS
                                </p>

                                <h2>
                                    Results for{" "}
                                    <span>
                                        &quot;{
                                            activeSearch
                                        }&quot;
                                    </span>
                                </h2>

                                <p className="search-result-summary">
                                    {
                                        searchPagination
                                            .totalItems
                                    }{" "}
                                    {searchPagination
                                        .totalItems ===
                                    1
                                        ? "movie"
                                        : "movies"}{" "}
                                    found
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-button clear-search-button"
                                onClick={
                                    clearSearch
                                }
                                disabled={
                                    isSearching
                                }
                            >
                                Clear search
                            </button>
                        </div>

                        {searchResults.length >
                        0 ? (
                            <>
                                <div
                                    className={
                                        isSearching
                                            ? "movie-grid search-grid is-updating"
                                            : "movie-grid search-grid"
                                    }
                                >
                                    {searchResults.map(
                                        (
                                            movie
                                        ) => (
                                            <MovieCard
                                                key={
                                                    movie.id
                                                }
                                                movie={
                                                    movie
                                                }
                                            />
                                        )
                                    )}
                                </div>

                                {searchPagination
                                    .totalPages >
                                    1 && (
                                    <nav
                                        className="search-pagination"
                                        aria-label="Search result pages"
                                    >
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            disabled={
                                                isSearching ||
                                                !searchPagination
                                                    .hasPreviousPage
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    searchPagination
                                                        .page -
                                                        1
                                                )
                                            }
                                        >
                                            <span aria-hidden="true">
                                                ←
                                            </span>

                                            Previous
                                        </button>

                                        <div
                                            className="search-pagination-info"
                                            aria-live="polite"
                                        >
                                            <strong>
                                                {
                                                    searchPagination
                                                        .page
                                                }
                                            </strong>

                                            <span>
                                                of{" "}
                                                {
                                                    searchPagination
                                                        .totalPages
                                                }
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            disabled={
                                                isSearching ||
                                                !searchPagination
                                                    .hasNextPage
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    searchPagination
                                                        .page +
                                                        1
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
                        ) : (
                            <div className="empty-state search-empty-state">
                                <div
                                    className="empty-state-icon"
                                    aria-hidden="true"
                                >
                                    ⌕
                                </div>

                                <h3>
                                    No movies found
                                </h3>

                                <p>
                                    Try another
                                    title or a
                                    broader search.
                                </p>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        clearSearch
                                    }
                                >
                                    Back to discover
                                </button>
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="discover-sections">
                        <MovieSection
                            kicker="THIS WEEK"
                            title="Trending Now"
                            subtitle="The movies getting the most attention right now."
                            movies={
                                trendingMovies
                            }
                        />

                        <MovieSection
                            kicker="AUDIENCE PICKS"
                            title="Popular"
                            subtitle="Titles audiences are discovering and watching."
                            movies={
                                popularMovies
                            }
                        />

                        <MovieSection
                            kicker="HIGHLY RATED"
                            title="Top Rated"
                            subtitle="Standout films with some of the strongest ratings."
                            movies={
                                topRatedMovies
                            }
                        />

                        <MovieSection
                            kicker="COMING SOON"
                            title="Upcoming"
                            subtitle="Keep an eye on what is heading to screens next."
                            movies={
                                upcomingMovies
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}


export default HomePage;