import {
    apiRequest,
} from "./client";


const getTrendingMovies =
    async () => {
        return apiRequest(
            "/tmdb/trending"
        );
    };


const getPopularMovies =
    async () => {
        return apiRequest(
            "/tmdb/popular"
        );
    };


const getTopRatedMovies =
    async () => {
        return apiRequest(
            "/tmdb/top-rated"
        );
    };


const getUpcomingMovies =
    async () => {
        return apiRequest(
            "/tmdb/upcoming"
        );
    };


const searchMovies = async (
    query,
    page = 1
) => {
    const params =
        new URLSearchParams({
            q: query,
            page:
                String(page),
        });


    return apiRequest(
        `/tmdb/search?${params.toString()}`
    );
};


const getMovieDetails =
    async (
        movieId
    ) => {
        return apiRequest(
            `/tmdb/movie/${movieId}`
        );
    };


const getMovieDetailsBatch =
    async (
        movieIds
    ) => {
        return apiRequest(
            "/tmdb/movies/batch",
            {
                method: "POST",

                body:
                    JSON.stringify({
                        movieIds:
                            movieIds.map(
                                (
                                    movieId
                                ) =>
                                    Number(
                                        movieId
                                    )
                            ),
                    }),
            }
        );
    };


const getMovieCast =
    async (
        movieId
    ) => {
        return apiRequest(
            `/tmdb/movie/${movieId}/cast`
        );
    };


const getMovieTrailers =
    async (
        movieId
    ) => {
        return apiRequest(
            `/tmdb/movie/${movieId}/trailers`
        );
    };


export {
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies,
    getMovieDetails,
    getMovieDetailsBatch,
    getMovieCast,
    getMovieTrailers,
};