const express = require('express');
const movieRoutes = require('./routes/movie.routes');
const logger =require('./middleware/logger');

const app =express();

app.use(express.json());
app.use(logger);

app.use("/movies", movieRoutes);

module.exports = app;