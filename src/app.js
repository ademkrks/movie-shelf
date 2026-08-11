const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Route'lar
const movieRoutes = require("./routes/movie.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const tmdbRoutes = require("./routes/tmdb.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const watchlistRoutes = require("./routes/watchlist.routes");
const reviewRoutes = require("./routes/review.routes");
const ratingRoutes = require("./routes/rating.routes");

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

// Swagger API dokümantasyonu
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route'lar
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/movies", movieRoutes);
app.use("/tmdb", tmdbRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/reviews", reviewRoutes);
app.use("/ratings", ratingRoutes);

// Tanımlanamayan endpointleri yakalar
app.use(notFound);

// Global hata yakalayıcı
app.use(errorHandler);

module.exports = app;