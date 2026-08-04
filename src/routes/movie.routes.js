//express routerı kullanacağız 
const express = require('express');
//yeni router oluşturur
const router = express.Router();
  //controller dosyasını dahil eder 
  const movieController = require('../controllers/movie.controller');
  //validation middlewar'i
  const validateMovie =require('../middleware/validateMovie');

  router.get("/",movieController.getMovies);

  router.post("/",validateMovie,movieController.createMovie);
  
  router.get("/:id",movieController.getMovieById);

  router.put("/:id",validateMovie,movieController.updateMovie);

  router.delete("/:id",movieController.deleteMovie);
  //routerı dışa aktarır
    module.exports = router;