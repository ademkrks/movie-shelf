const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const swaggerSpec = require("./config/swagger");
const env = require("./config/env");


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


// Express'in teknoloji bilgisini response header'ında göstermesini engeller
app.disable("x-powered-by");


// HTTP güvenlik header'ları
app.use(
    helmet()
);


// CORS
app.use(
    cors({
        origin:
            env.corsOrigins,

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);


// Health check
app.get(
    "/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            status: "ok",
        });
    }
);


// Çalışma ortamına göre genel API limitini belirler
const getApiRateLimit = () => {
    if (env.isTest) {
        return 10000;
    }


    if (env.isDevelopment) {
        return 5000;
    }


    return 500;
};


// Genel API rate limit
const apiLimiter = rateLimit({
    windowMs:
        15 * 60 * 1000,

    limit:
        getApiRateLimit(),

    standardHeaders:
        "draft-8",

    legacyHeaders:
        false,

    /*
     * CORS preflight istekleri ve
     * Swagger dokümantasyonu genel API
     * kotasını tüketmez.
     */
    skip: (req) => {
        return (
            req.method ===
                "OPTIONS" ||
            req.path.startsWith(
                "/api-docs"
            )
        );
    },

    message: {
        success: false,
        status: "error",
        message:
            "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
    },
});


app.use(
    apiLimiter
);


// JSON body boyutunu sınırlar
app.use(
    express.json({
        limit: "100kb",
    })
);


// Gelen istekleri loglar
app.use(
    logger
);


// Swagger API dokümantasyonu
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(
        swaggerSpec
    )
);


// Route'lar
app.use(
    "/auth",
    authRoutes
);

app.use(
    "/users",
    userRoutes
);

app.use(
    "/movies",
    movieRoutes
);

app.use(
    "/tmdb",
    tmdbRoutes
);

app.use(
    "/favorites",
    favoriteRoutes
);

app.use(
    "/watchlist",
    watchlistRoutes
);

app.use(
    "/reviews",
    reviewRoutes
);

app.use(
    "/ratings",
    ratingRoutes
);


// Tanımlanamayan endpointleri yakalar
app.use(
    notFound
);


// Global hata yakalayıcı
app.use(
    errorHandler
);


module.exports = app;