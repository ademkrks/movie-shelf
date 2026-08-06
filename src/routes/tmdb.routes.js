const express =require("express");

const router =express.Router();

const tmdbController = require("../controllers/tmdb.controller");

router.get("/trending",tmdbController.getTrendingMovies);

module.exports=router;