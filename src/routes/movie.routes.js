const express = require('express');

const router = express.Router();

  const movieController = require('../controllers/movie.controller');

  const validateMovie =require('../middleware/validateMovie');

  router.get("/",movieController.getMovies);

  router.post("/",validateMovie,movieController.createMovie);
  
  router.get("/:id",movieController.getMovieById);

  router.put("/:id",validateMovie,movieController.updateMovie);

  router.delete("/:id",movieController.deleteMovie);

    module.exports = router;