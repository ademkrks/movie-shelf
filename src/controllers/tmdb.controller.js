const tmdbService = require("../services/tmdb.service");
const response = require("../utils/response");

// Trend filmleri getirir
const getTrendingMovies = async (req, res, next) => {
    try {
        const movies = await tmdbService.getTrendingMovies();

        response.success(
            res,
            movies,
            "Trend filmler getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// Popüler filmleri getirir
const getPopularMovies = async (req, res, next) => {
    try {
        const movies = await tmdbService.getPopularMovies();

        response.success(
            res,
            movies,
            "Popüler filmler getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// En yüksek puanlı filmleri getirir
const getTopRatedMovies = async (req, res, next) => {
    try {
        const movies = await tmdbService.getTopRatedMovies();

        response.success(
            res,
            movies,
            "En yüksek puanlı filmler getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// Yakında vizyona girecek filmleri getirir
const getUpcomingMovies = async (req, res, next) => {
    try {
        const movies = await tmdbService.getUpcomingMovies();

        response.success(
            res,
            movies,
            "Yakında vizyona girecek filmler getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// Film arar
const searchMovie = async (req, res, next) => {
    try {
        const movies = await tmdbService.searchMovies(req.query.q);

        response.success(
            res,
            movies,
            "Arama sonuçları getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// Film detaylarını getirir
const getMovieDetails = async (req, res, next) => {
    try {
        const movie = await tmdbService.getMovieDetails(
            req.params.id
        );

        response.success(
            res,
            movie,
            "Film detayları getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// Film oyuncu kadrosunu getirir
const getMovieCast = async (req, res, next) => {
    try {
        const cast = await tmdbService.getMovieCast(
            req.params.id
        );

        response.success(
            res,
            cast,
            "Film oyuncu kadrosu getirildi."
        );
    } catch (error) {
        next(error);
    }
};

// Film fragmanlarını getirir
const getMovieTrailers = async (req, res, next) => {
    try {
        const trailers = await tmdbService.getMovieTrailers(
            req.params.id
        );

        response.success(
            res,
            trailers,
            "Film fragmanları getirildi."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovie,
    getMovieDetails,
    getMovieCast,
    getMovieTrailers,
};