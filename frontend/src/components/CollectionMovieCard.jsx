import {
    Link,
} from "react-router";


const POSTER_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


function CollectionMovieCard({
    movie,
    removeLabel,
    isRemoving,
    onRemove,
}) {
    const releaseYear =
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


    return (
        <article className="collection-movie-card">
            <Link
                to={`/movie/${movie.id}`}
                className="collection-poster-link"
            >
                <div className="movie-poster-wrapper">
                    {movie.poster_path ? (
                        <img
                            src={
                                POSTER_BASE_URL +
                                movie.poster_path
                            }
                            alt={
                                movie.title ||
                                "Film posteri"
                            }
                            className="movie-poster"
                            loading="lazy"
                        />
                    ) : (
                        <div className="movie-poster-placeholder">
                            Poster yok
                        </div>
                    )}

                    <div className="movie-rating">
                        <span>
                            ★
                        </span>

                        {rating}
                    </div>
                </div>
            </Link>

            <div className="collection-card-content">
                <Link
                    to={`/movie/${movie.id}`}
                    className="collection-movie-info"
                >
                    <h3>
                        {movie.title}
                    </h3>

                    <span>
                        {releaseYear}
                    </span>
                </Link>

                <button
                    type="button"
                    className="collection-remove-button"
                    onClick={
                        onRemove
                    }
                    disabled={
                        isRemoving
                    }
                >
                    {isRemoving
                        ? "Kaldırılıyor..."
                        : removeLabel}
                </button>
            </div>
        </article>
    );
}


export default CollectionMovieCard;