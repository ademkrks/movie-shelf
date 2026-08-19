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
import "../styles/movie-detail.css";


const POSTER_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

const BACKDROP_BASE_URL =
    "https://image.tmdb.org/t/p/original";

const PROFILE_BASE_URL =
    "https://image.tmdb.org/t/p/w185";


function MovieDetailSkeleton() {
    return (
        <article
            className="movie-detail-page movie-detail-page-loading"
            aria-busy="true"
            aria-label="Loading movie details"
        >
            <div className="detail-loading-backdrop" />

            <div className="movie-detail-container">
                <div className="detail-loading-main">
                    <div className="detail-loading-poster" />

                    <div className="detail-loading-content">
                        <div className="detail-loading-line detail-loading-eyebrow" />

                        <div className="detail-loading-line detail-loading-title" />

                        <div className="detail-loading-line detail-loading-title detail-loading-title-short" />

                        <div className="detail-loading-line detail-loading-tagline" />

                        <div className="detail-loading-meta">
                            <span />
                            <span />
                            <span />
                        </div>

                        <div className="detail-loading-actions">
                            <span />
                            <span />
                        </div>

                        <div className="detail-loading-line detail-loading-overview" />
                        <div className="detail-loading-line detail-loading-overview" />
                        <div className="detail-loading-line detail-loading-overview detail-loading-overview-short" />
                    </div>
                </div>
            </div>
        </article>
    );
}


function MovieDetailPage() {
    const {
        id,
    } = useParams();


    const [
        loadState,
        setLoadState,
    ] = useState({
        movieId: null,
        movie: null,
        cast: [],
        trailers: [],
        error: "",
    });


    const isLoading =
        loadState.movieId !==
        id;


    const movie =
        isLoading
            ? null
            : loadState.movie;

    const cast =
        isLoading
            ? []
            : loadState.cast;

    const trailers =
        isLoading
            ? []
            : loadState.trailers;

    const error =
        isLoading
            ? ""
            : loadState.error;


    useEffect(() => {
        const controller =
            new AbortController();

        const currentMovieId =
            id;


        const requestOptions = {
            signal:
                controller.signal,
        };


        Promise.allSettled([
            getMovieDetails(
                currentMovieId,
                requestOptions
            ),

            getMovieCast(
                currentMovieId,
                requestOptions
            ),

            getMovieTrailers(
                currentMovieId,
                requestOptions
            ),
        ])
            .then(
                (
                    results
                ) => {
                    if (
                        controller.signal
                            .aborted
                    ) {
                        return;
                    }


                    const [
                        movieResult,
                        castResult,
                        trailerResult,
                    ] = results;


                    /*
                     * Film detayları ana veri olduğu için
                     * bu istek başarısızsa sayfa yüklenemez.
                     */
                    if (
                        movieResult.status ===
                        "rejected"
                    ) {
                        setLoadState({
                            movieId:
                                currentMovieId,

                            movie: null,

                            cast: [],

                            trailers: [],

                            error:
                                movieResult.reason
                                    ?.message ||
                                "Movie could not be loaded.",
                        });


                        return;
                    }


                    /*
                     * Cast ve trailer ek içeriktir.
                     * Bu isteklerden biri başarısız olsa bile
                     * ana film sayfası kullanılabilir kalır.
                     */
                    const nextCast =
                        castResult.status ===
                        "fulfilled"
                            ? castResult.value
                                ?.data ||
                            []
                            : [];


                    const nextTrailers =
                        trailerResult.status ===
                        "fulfilled"
                            ? trailerResult.value
                                ?.data ||
                            []
                            : [];


                    setLoadState({
                        movieId:
                            currentMovieId,

                        movie:
                            movieResult.value
                                ?.data ||
                            null,

                        cast:
                            nextCast,

                        trailers:
                            nextTrailers,

                        error: "",
                    });
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (
                        controller.signal
                            .aborted
                    ) {
                        return;
                    }


                    setLoadState({
                        movieId:
                            currentMovieId,

                        movie: null,

                        cast: [],

                        trailers: [],

                        error:
                            requestError
                                .message ||
                            "Movie could not be loaded.",
                    });
                }
            );


        return () => {
            controller.abort();
        };
    }, [
        id,
    ]);


    if (isLoading) {
        return (
            <MovieDetailSkeleton />
        );
    }


    if (
        error ||
        !movie
    ) {
        return (
            <section className="movie-detail-error">
                <div className="movie-detail-error-icon">
                    !
                </div>

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
            <section className="movie-detail-hero">
                <div
                    className="movie-backdrop"
                    style={
                        movie.backdrop_path
                            ? {
                                backgroundImage:
                                    `url("${BACKDROP_BASE_URL}${movie.backdrop_path}")`,
                            }
                            : undefined
                    }
                />

                <div className="movie-backdrop-shade" />

                <div className="movie-detail-container movie-detail-hero-inner">
                    <Link
                        to="/"
                        className="detail-back-link"
                    >
                        <span aria-hidden="true">
                            ←
                        </span>

                        Back to discover
                    </Link>

                    <div className="movie-detail-main">
                        <div className="movie-detail-poster-area">
                            <div className="movie-detail-poster">
                                {movie.poster_path ? (
                                    <img
                                        src={
                                            POSTER_BASE_URL +
                                            movie.poster_path
                                        }
                                        alt={`${movie.title} poster`}
                                    />
                                ) : (
                                    <div className="movie-poster-placeholder">
                                        No poster
                                    </div>
                                )}
                            </div>

                            <div className="poster-rating-badge">
                                <span aria-hidden="true">
                                    ★
                                </span>

                                <div>
                                    <strong>
                                        {rating}
                                    </strong>

                                    <small>
                                        TMDB
                                    </small>
                                </div>
                            </div>
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
                                    {movie.tagline}
                                </p>
                            )}

                            <div className="movie-meta">
                                <span className="movie-meta-item">
                                    {year}
                                </span>

                                <span
                                    className="movie-meta-separator"
                                    aria-hidden="true"
                                />

                                <span className="movie-meta-item movie-meta-rating">
                                    <span aria-hidden="true">
                                        ★
                                    </span>

                                    {rating}
                                </span>

                                <span
                                    className="movie-meta-separator"
                                    aria-hidden="true"
                                />

                                <span className="movie-meta-item">
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
                                <p className="detail-section-label">
                                    STORY
                                </p>

                                <h2>
                                    Overview
                                </h2>

                                <p className="movie-overview-text">
                                    {movie.overview ||
                                        "No overview available."}
                                </p>
                            </div>

                            {mainTrailer && (
                                <a
                                    href={`https://www.youtube.com/watch?v=${mainTrailer.key}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="primary-button trailer-button"
                                >
                                    <span
                                        className="trailer-play-icon"
                                        aria-hidden="true"
                                    >
                                        ▶
                                    </span>

                                    Watch Trailer
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="movie-detail-body">
                <div className="movie-detail-container">
                    {cast.length > 0 && (
                        <section className="cast-section">
                            <div className="detail-section-heading">
                                <div>
                                    <p className="detail-section-label">
                                        CAST
                                    </p>

                                    <h2>
                                        Top Cast
                                    </h2>

                                    <p>
                                        Meet some of
                                        the people
                                        behind the
                                        characters.
                                    </p>
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
                                                <div className="cast-image">
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
                                                            <span>
                                                                {person.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase() ||
                                                                    "?"}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="cast-info">
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

                    <div className="movie-community-heading">
                        <p className="detail-section-label">
                            YOUR MOVIESHELF
                        </p>

                        <h2>
                            Rate & discuss
                        </h2>

                        <p>
                            Add your rating and
                            see what the
                            MovieShelf community
                            thinks.
                        </p>
                    </div>

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
            </div>
        </article>
    );
}


export default MovieDetailPage;