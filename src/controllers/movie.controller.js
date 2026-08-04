// Service katmanını içe aktarır
const movieService = require("../services/movie.service");

// Tüm filmleri getirir
const getMovies = async (req, res, next) => {
    try {
        const movies = await movieService.getMovies();
        res.json(movies);
    } catch (error) {
        next(error);
    }
};

// ID'ye göre film getirir
const getMovieById = async (req, res, next) => {
    try {
        const movie = await movieService.getMovieById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                message: "Film bulunamadı",
            });
        }

        res.json(movie);
    } catch (error) {
        next(error);
    }
};

// Yeni film oluşturur
const createMovie = async (req, res, next) => {
    try {
        const movie = await movieService.createMovie(req.body);
        res.status(201).json(movie);
    } catch (error) {
        next(error);
    }
};

// Filmi günceller
const updateMovie = async (req, res, next) => {
    try {
        const movie = await movieService.updateMovie(
            req.params.id,
            req.body
        );

        res.json(movie);
    } catch (error) {
        next(error);
    }
};

// Filmi siler
const deleteMovie = async (req, res, next) => {
    try {
        await movieService.deleteMovie(req.params.id);

        res.json({
            message: "Film silindi",
        });
    } catch (error) {
        next(error);
    }
};

// Fonksiyonları dışa aktarır
module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};