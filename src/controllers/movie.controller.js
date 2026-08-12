// Film servisini içe aktarır
const movieService = require("../services/movie.service");

// Standart API cevaplarını içe aktarır
const response = require("../utils/response");

// Asenkron hata yakalayıcısını içe aktarır
const asyncHandler = require("../middleware/asyncHandler");

// Özel hata sınıfını içe aktarır
const AppError = require("../utils/AppError");


// Tüm filmleri getirir
const getMovies = asyncHandler(async (req, res) => {
    const movies = await movieService.getMovies();

    response.list(res, movies);
});


// ID'ye göre film getirir
const getMovieById = asyncHandler(async (req, res) => {
    const movie = await movieService.getMovieById(
        req.params.id
    );

    if (!movie) {
        throw new AppError(
            "Film bulunamadı.",
            404
        );
    }

    response.success(
        res,
        movie,
        "Film başarıyla getirildi."
    );
});


// Yeni film oluşturur
const createMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.createMovie(
        req.body
    );

    response.success(
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

    response.success(
        res,
        movie,
        "Film başarıyla güncellendi."
    );
});


// Filmi siler
const deleteMovie = asyncHandler(async (req, res) => {
    await movieService.deleteMovie(
        req.params.id
    );

    response.success(
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