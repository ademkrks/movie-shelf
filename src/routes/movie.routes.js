const express = require('express');

const router = express.Router();

  const movieController = require('../controllers/movie.controller');

  router.get("/",movieController.getMovies);

  router.post("/",movieController.createMovie);
  
  router.get("/:id",movieController.getMovieById);

  
    module.exports = router;