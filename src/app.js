const express = require('express');
const movieRoutes = require('./routes/movie.routes');
const logger =require('./middleware/logger');
const errorHandler =require('./middleware/errorHandler');
//express uygulamasını oluşturur
const app =express();
//Json verilerini okuyabilmek için 
app.use(express.json());
//gelen istekleri loglamak için
app.use(logger);
//film route'ları
app.use("/movies", movieRoutes);
//Global hata yakalayıcı
app.use(errorHandler);

module.exports = app;