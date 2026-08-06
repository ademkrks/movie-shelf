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

module.exports=router;