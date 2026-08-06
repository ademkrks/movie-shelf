const express =require("express");

const router =express.Router();

const tmdbController = require("../controllers/tmdb.controller");
const { getTopRatedMovies } = require("../services/tmdb.service");

//Trend Filmler
router.get("/trending",tmdbController.getTrendingMovies);

//Popüler Filmler 
router.get("/popular",tmdbController.getPopularMovies);

//En Yüksek Puanlı Filmler
router.get("/top-rated",tmdbController.getTopRatedMovies);

//Yakında Vizyona Girecek Filmler
router.get("/upcoming",tmdbController.getUpcomingMovies);

//Film Arar
router.get("/search",tmdbController.searchMovie);

//Film Detayı
router.get("/movie/:id",tmdbController.getMovieDetails);

//Film Kadrosu
router.get("/movie/:id/cast",tmdbController.getMovieCast);

module.exports=router;