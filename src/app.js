const express = require("express");

const tmdbRoutes= require("./routes/tmdb.routes");
const movieRoutes = require("./routes/movie.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

// Express uygulamasını oluşturur
const app = express();

// JSON verilerini okuyabilmek için
app.use(express.json());

// Gelen istekleri loglar
app.use(logger);

// Authentication route'ları
app.use("/auth", authRoutes);

// User route'ları
app.use("/users", userRoutes);

// Movie route'ları
app.use("/movies", movieRoutes);

app.use("/tmdb",tmdbRoutes);

// Tanımlanamayan endpoint'leri yakalar
app.use(notFound);

// Global hata yakalayıcı
app.use(errorHandler);

module.exports = app;