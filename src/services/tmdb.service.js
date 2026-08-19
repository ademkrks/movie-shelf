const axios = require("axios");

const env = require("../config/env");
const AppError = require("../utils/AppError");


// TMDB API bağlantısı
const api = axios.create({
    baseURL: env.tmdbBaseUrl,

    timeout: 10000,

    headers: {
        Authorization: `Bearer ${env.tmdbApiKey}`,
        Accept: "application/json",
    },
});


// TMDB kaynaklı hataları güvenli API hatalarına çevirir
const handleTmdbError = (error) => {
    // TMDB üzerinde kaynak bulunamadı
    if (error.response?.status === 404) {
        throw new AppError(
            "TMDB üzerinde istenen kaynak bulunamadı.",
            404
        );
    }

    // İstek zaman aşımına uğradı
    if (
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT"
    ) {
        throw new AppError(
            "TMDB servisi zaman aşımına uğradı.",
            504
        );
    }

    // TMDB cevap verdi ancak hata döndürdü
    if (error.response) {
        throw new AppError(
            "TMDB servisinden geçerli bir cevap alınamadı.",
            502
        );
    }

    // TMDB servisine hiç ulaşılamadı
    if (error.request) {
        throw new AppError(
            "TMDB servisine ulaşılamadı.",
            502
        );
    }

    // Beklenmeyen hata
    throw error;
};


// Haftalık trend filmleri getirir
const getTrendingMovies = async () => {
    try {
        const response = await api.get(
            "/trending/movie/week"
        );

        return response.data.results;
    } catch (error) {
        handleTmdbError(error);
    }
};


// Popüler filmleri getirir
const getPopularMovies = async () => {
    try {
        const response = await api.get(
            "/movie/popular"
        );

        return response.data.results;
    } catch (error) {
        handleTmdbError(error);
    }
};


// En yüksek puanlı filmleri getirir
const getTopRatedMovies = async () => {
    try {
        const response = await api.get(
            "/movie/top_rated"
        );

        return response.data.results;
    } catch (error) {
        handleTmdbError(error);
    }
};


// Yakında vizyona girecek filmleri getirir
const getUpcomingMovies = async () => {
    try {
        const response = await api.get(
            "/movie/upcoming"
        );

        return response.data.results;
    } catch (error) {
        handleTmdbError(error);
    }
};


// Film arar ve pagination bilgilerini getirir
const searchMovies = async (
    query,
    page = 1
) => {
    try {
        const normalizedPage =
            Number(page);

        const response = await api.get(
            "/search/movie",
            {
                params: {
                    query,
                    page:
                        normalizedPage,
                },
            }
        );


        const currentPage =
            Number(
                response.data.page
            ) ||
            normalizedPage;

        const totalPages =
            Number(
                response.data
                    .total_pages
            ) ||
            0;

        const totalItems =
            Number(
                response.data
                    .total_results
            ) ||
            0;


        return {
            items:
                response.data
                    .results ||
                [],

            pagination: {
                page:
                    currentPage,

                totalPages,

                totalItems,

                hasNextPage:
                    currentPage <
                    totalPages,

                hasPreviousPage:
                    currentPage >
                    1,
            },
        };
    } catch (error) {
        handleTmdbError(error);
    }
};


// Film detayını getirir
const getMovieDetails = async (movieId) => {
    try {
        const response = await api.get(
            `/movie/${movieId}`
        );

        return response.data;
    } catch (error) {
        handleTmdbError(error);
    }
};


// Film oyuncu kadrosunu getirir
const getMovieCast = async (movieId) => {
    try {
        const response = await api.get(
            `/movie/${movieId}/credits`
        );

        return response.data.cast;
    } catch (error) {
        handleTmdbError(error);
    }
};


// Film fragmanlarını getirir
const getMovieTrailers = async (movieId) => {
    try {
        const response = await api.get(
            `/movie/${movieId}/videos`
        );

        return response.data.results.filter(
            (video) =>
                video.site === "YouTube" &&
                video.type === "Trailer"
        );
    } catch (error) {
        handleTmdbError(error);
    }
};


// Fonksiyonları dışa aktarır
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