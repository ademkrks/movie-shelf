// Film servisini içe aktarır
const movieService = require("../services/movie.service");

// Standart API cevaplarını içe aktarır
const {
    successResponse,
    listResponse,
} = require("../utils/response");

// Asenkron hata yakalayıcısını içe aktarır
const asyncHandler = require("../middleware/asyncHandler");

// Özel hata sınıfını içe aktarır
const AppError = require("../utils/AppError");

// Tüm filmleri getirir
const getMovies = asyncHandler(async (req, res) => {
    const movies = await movieService.getMovies();

    listResponse(res, movies);
});

// ID'ye göre film getirir
const getMovieById = asyncHandler(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.id);

    if (!movie) {
        throw new AppError("Film bulunamadı.", 404);
    }

    successResponse(
        res,
        movie,
        "Film başarıyla getirildi."
    );
});

// Yeni film oluşturur
const createMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.createMovie(req.body);

    successResponse(
        res,
        movie,
        "Film başarıyla oluşturuldu.",
        201
    );
});

// Filmi günceller
const updateMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.updateMovie(
        req.params.id,
        req.body
    );

    if (!movie) {
        throw new AppError("Film bulunamadı.", 404);
    }

    successResponse(
        res,
        movie,
        "Film başarıyla güncellendi."
    );
});

// Filmi siler
const deleteMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.deleteMovie(req.params.id);

    if (!movie) {
        throw new AppError("Film bulunamadı.", 404);
    }

    successResponse(
        res,
        null,
        "Film başarıyla silindi."
    );
});

// Fonksiyonları dışa aktarır
module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};