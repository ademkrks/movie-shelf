const axios = require("axios");

const api = axios.create({
    baseURL: process.env.TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        Accept: "application/json",
    },
});

// Haftalık trend filmleri getirir
const getTrendingMovies = async () => {
    const response = await api.get("/trending/movie/week");

    return response.data.results;
};

// Popüler filmleri getirir
const getPopularMovies = async () => {
    const response = await api.get("/movie/popular");

    return response.data.results;
};

// En yüksek puanlı filmleri getirir
const getTopRatedMovies = async () => {
    const response = await api.get("/movie/top_rated");

    return response.data.results;
};

// Yakında vizyona girecek filmleri getirir
const getUpcomingMovies = async () => {
    const response = await api.get("/movie/upcoming");

    return response.data.results;
};

// Film arar
const searchMovies = async (query) => {
    const response = await api.get("/search/movie", {
        params: {
            query,
        },
    });

    return response.data.results;
};

// Film detayını getirir
const getMovieDetails = async (movieId) => {
    const response = await api.get(`/movie/${movieId}`);

    return response.data;
};

// Film oyuncu kadrosunu getirir
const getMovieCast = async (movieId) => {
    const response = await api.get(`/movie/${movieId}/credits`);

    return response.data.cast;
};

// Film fragmanlarını getirir
const getMovieTrailers = async (movieId) => {
    const response = await api.get(`/movie/${movieId}/videos`);

    return response.data.results.filter(
        (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer"
    );
};

module.exports = {
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies,
    getMovieDetails,
    getMovieCast,
    getMovieTrailers,
};