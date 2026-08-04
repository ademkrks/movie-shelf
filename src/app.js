const express = require('express');
const movieRoutes = require('./routes/movie.routes');

const app =express();

app.use(express.json());
app.use("/movies", movieRoutes);

module.exports = app;