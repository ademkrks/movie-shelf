const auth =require("../middleware/auth");

// Express Router'ı içe aktarır
const express = require("express");

// Router oluşturur
const router = express.Router();

// Controller katmanını içe aktarır
const movieController = require("../controllers/movie.controller");

// Doğrulama (Validation) middleware'ini içe aktarır
const validateMovie = require("../middleware/validateMovie");

// Tüm filmleri getirir
router.get("/", movieController.getMovies);

// ID'ye göre film getirir
router.get("/:id", movieController.getMovieById);

// Yeni film oluşturur
router.post("/",auth,validateMovie,movieController.createMovie);

// Filmi günceller
router.put("/:id",auth,validateMovie, movieController.updateMovie);

// Filmi siler
router.delete("/:id",auth, movieController.deleteMovie);

// Router'ı dışa aktarır
module.exports = router;