import {
    Link,
} from "react-router";


const POSTER_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


function MovieCard({
    movie,
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
        <Link
            to={`/movie/${movie.id}`}
            className="movie-card"
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

            <div className="movie-card-content">
                <h3>
                    {movie.title}
                </h3>

                <span>
                    {releaseYear}
                </span>
            </div>
        </Link>
    );
}


export default MovieCard;