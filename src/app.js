const express = require("express");

// Route'lar
const movieRoutes = require("./routes/movie.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const tmdbRoutes = require("./routes/tmdb.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const watchlistRoutes = require("./routes/watchlist.routes");

// Middleware
const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

// Express uygulamasını oluşturur
const app = express();

// JSON verilerini okuyabilmek için
app.use(express.json());

// Gelen istekleri loglar
app.use(logger);

// Route'lar
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/movies", movieRoutes);
app.use("/tmdb", tmdbRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/watchlist", watchlistRoutes);

// Tanımlanamayan endpointleri yakalar
app.use(notFound);

// Global hata yakalayıcı
app.use(errorHandler);

module.exports = app;