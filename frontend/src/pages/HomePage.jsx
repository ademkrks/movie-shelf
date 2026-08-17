import {
    useEffect,
    useState,
} from "react";

import MovieCard from "../components/MovieCard";

import {
    getPopularMovies,
    getTopRatedMovies,
    getTrendingMovies,
    getUpcomingMovies,
    searchMovies,
} from "../api/tmdb.api";


function MovieSection({
    title,
    subtitle,
    movies,
}) {
    return (
        <section className="movie-section">
            <div className="section-heading">
                <div>
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


    const handleSearch =
        async (event) => {
            event.preventDefault();

            const query =
                searchQuery.trim();


            if (!query) {
                return;
            }


            setError("");
            setIsSearching(true);


            try {
                const response =
                    await searchMovies(
                        query
                    );


                setSearchResults(
                    response.data ||
                    []
                );

                setActiveSearch(
                    query
                );
            } catch (
                requestError
            ) {
                setError(
                    requestError.message
                );
            } finally {
                setIsSearching(
                    false
                );
            }
        };


    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setActiveSearch("");
    };


    return (
        <div className="movies-page">
            <section className="movies-hero">
                <div className="movies-hero-content">
                    <p className="eyebrow">
                        YOUR PERSONAL MOVIE SPACE
                    </p>

                    <h1>
                        Discover your
                        next favorite
                        movie.
                    </h1>

                    <p className="movies-hero-description">
                        Explore trending
                        movies, discover
                        popular titles and
                        build your own
                        MovieShelf.
                    </p>

                    <form
                        className="movie-search-form"
                        onSubmit={
                            handleSearch
                        }
                    >
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
                            placeholder="Search movies..."
                            aria-label="Search movies"
                        />

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
                </div>
            </section>

            <div className="movie-content">
                {error && (
                    <div className="form-error movie-page-message">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="movies-loading">
                        Loading movies...
                    </div>
                ) : activeSearch ? (
                    <>
                        <div className="search-result-heading">
                            <div>
                                <p className="eyebrow">
                                    SEARCH RESULTS
                                </p>

                                <h2>
                                    Results for
                                    &quot;{
                                        activeSearch
                                    }&quot;
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    clearSearch
                                }
                            >
                                Clear search
                            </button>
                        </div>

                        {searchResults.length >
                        0 ? (
                            <div className="movie-grid">
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
                        ) : (
                            <div className="empty-state">
                                No movies found.
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <MovieSection
                            title="Trending Now"
                            subtitle="Movies people are watching this week."
                            movies={
                                trendingMovies
                            }
                        />

                        <MovieSection
                            title="Popular"
                            subtitle="The most popular movies right now."
                            movies={
                                popularMovies
                            }
                        />

                        <MovieSection
                            title="Top Rated"
                            subtitle="Some of the highest rated movies."
                            movies={
                                topRatedMovies
                            }
                        />

                        <MovieSection
                            title="Coming Soon"
                            subtitle="Movies heading to screens soon."
                            movies={
                                upcomingMovies
                            }
                        />
                    </>
                )}
            </div>
        </div>
    );
}


export default HomePage;