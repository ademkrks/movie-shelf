import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router";

import MovieActionButtons from "../components/MovieActionButtons";
import RatingSection from "../components/RatingSection";
import ReviewSection from "../components/ReviewSection";

import {
    getMovieCast,
    getMovieDetails,
    getMovieTrailers,
} from "../api/tmdb.api";

import "../styles/reviews.css";


const POSTER_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

const BACKDROP_BASE_URL =
    "https://image.tmdb.org/t/p/original";

const PROFILE_BASE_URL =
    "https://image.tmdb.org/t/p/w185";


function MovieDetailPage() {
    const {
        id,
    } = useParams();


    const [
        movie,
        setMovie,
    ] = useState(null);

    const [
        cast,
        setCast,
    ] = useState([]);

    const [
        trailers,
        setTrailers,
    ] = useState([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {
        const loadMovie =
            async () => {
                setIsLoading(
                    true
                );

                setError("");


                try {
                    const [
                        movieResponse,
                        castResponse,
                        trailerResponse,
                    ] =
                        await Promise.all([
                            getMovieDetails(
                                id
                            ),

                            getMovieCast(
                                id
                            ),

                            getMovieTrailers(
                                id
                            ),
                        ]);


                    setMovie(
                        movieResponse.data
                    );

                    setCast(
                        castResponse.data ||
                        []
                    );

                    setTrailers(
                        trailerResponse.data ||
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


        loadMovie();
    }, [id]);


    if (isLoading) {
        return (
            <div className="movies-loading movie-detail-loading">
                Loading movie...
            </div>
        );
    }


    if (
        error ||
        !movie
    ) {
        return (
            <section className="movie-detail-error">
                <p className="eyebrow">
                    MOVIE DETAILS
                </p>

                <h1>
                    Movie could not
                    be loaded.
                </h1>

                <p>
                    {error ||
                        "Movie not found."}
                </p>

                <Link
                    to="/"
                    className="primary-button inline-button"
                >
                    Back to Home
                </Link>
            </section>
        );
    }


    const year =
        movie.release_date
            ? movie.release_date.slice(
                0,
                4
            )
            : "—";


    const rating =
        typeof movie.vote_average ===
        "number"
            ? movie.vote_average.toFixed(
                1
            )
            : "—";


    const runtime =
        movie.runtime
            ? `${Math.floor(
                movie.runtime / 60
            )}h ${
                movie.runtime %
                60
            }m`
            : "—";


    const mainTrailer =
        trailers[0];


    return (
        <article className="movie-detail-page">
            <div
                className="movie-backdrop"
                style={
                    movie.backdrop_path
                        ? {
                            backgroundImage:
                                `linear-gradient(
                                    to bottom,
                                    rgba(15, 17, 21, 0.2),
                                    #0f1115
                                ),
                                url("${BACKDROP_BASE_URL}${movie.backdrop_path}")`,
                        }
                        : undefined
                }
            />

            <div className="movie-detail-container">
                <div className="movie-detail-main">
                    <div className="movie-detail-poster">
                        {movie.poster_path ? (
                            <img
                                src={
                                    POSTER_BASE_URL +
                                    movie.poster_path
                                }
                                alt={
                                    movie.title
                                }
                            />
                        ) : (
                            <div className="movie-poster-placeholder">
                                No poster
                            </div>
                        )}
                    </div>

                    <div className="movie-detail-content">
                        <p className="eyebrow">
                            MOVIE
                        </p>

                        <h1>
                            {movie.title}
                        </h1>

                        {movie.tagline && (
                            <p className="movie-tagline">
                                {
                                    movie.tagline
                                }
                            </p>
                        )}

                        <div className="movie-meta">
                            <span>
                                {year}
                            </span>

                            <span>
                                TMDB ★{" "}
                                {rating}
                            </span>

                            <span>
                                {runtime}
                            </span>
                        </div>

                        {movie.genres?.length >
                            0 && (
                            <div className="movie-genres">
                                {movie.genres.map(
                                    (
                                        genre
                                    ) => (
                                        <span
                                            key={
                                                genre.id
                                            }
                                        >
                                            {
                                                genre.name
                                            }
                                        </span>
                                    )
                                )}
                            </div>
                        )}

                        <MovieActionButtons
                            movieId={
                                movie.id
                            }
                        />

                        <div className="movie-overview">
                            <h2>
                                Overview
                            </h2>

                            <p>
                                {
                                    movie.overview ||
                                    "No overview available."
                                }
                            </p>
                        </div>

                        {mainTrailer && (
                            <a
                                href={`https://www.youtube.com/watch?v=${mainTrailer.key}`}
                                target="_blank"
                                rel="noreferrer"
                                className="primary-button trailer-button"
                            >
                                Watch Trailer
                            </a>
                        )}
                    </div>
                </div>

                {cast.length > 0 && (
                    <section className="cast-section">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">
                                    CAST
                                </p>

                                <h2>
                                    Top Cast
                                </h2>
                            </div>
                        </div>

                        <div className="cast-grid">
                            {cast
                                .slice(
                                    0,
                                    12
                                )
                                .map(
                                    (
                                        person
                                    ) => (
                                        <article
                                            key={
                                                person.cast_id ||
                                                person.credit_id
                                            }
                                            className="cast-card"
                                        >
                                            {person.profile_path ? (
                                                <img
                                                    src={
                                                        PROFILE_BASE_URL +
                                                        person.profile_path
                                                    }
                                                    alt={
                                                        person.name
                                                    }
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="cast-placeholder">
                                                    ?
                                                </div>
                                            )}

                                            <div>
                                                <strong>
                                                    {
                                                        person.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        person.character ||
                                                        "—"
                                                    }
                                                </span>
                                            </div>
                                        </article>
                                    )
                                )}
                        </div>
                    </section>
                )}

                <div className="movie-community">
                    <RatingSection
                        key={`rating-${movie.id}`}
                        movieId={
                            movie.id
                        }
                    />

                    <ReviewSection
                        key={`reviews-${movie.id}`}
                        movieId={
                            movie.id
                        }
                    />
                </div>
            </div>
        </article>
    );
}


export default MovieDetailPage;