const express = require("express");

const movieRoutes = require("./routes/movie.routes");
const authRoutes = require("./routes/auth.routes");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use(logger);

// Route'lar
app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);

// Bulunamayan endpointler
app.use(notFound);

// Global hata yakalayıcı
app.use(errorHandler);

module.exports = app;