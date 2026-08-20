const express = require(
    "express"
);

const rateLimit = require(
    "express-rate-limit"
);


const router =
    express.Router();


const tmdbController = require(
    "../controllers/tmdb.controller"
);

const auth = require(
    "../middleware/auth"
);

const validateRequest = require(
    "../middleware/validateRequest"
);


const {
    tmdbIdValidation,
    movieSearchValidation,
    movieBatchValidation,
} = require(
    "../validations/tmdb.validation"
);


// Batch endpoint'in upstream TMDB çağrılarını sınırlar
const tmdbBatchLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 30,

        standardHeaders:
            "draft-8",

        legacyHeaders:
            false,

        message: {
            success: false,
            status: "error",
            message:
                "Çok fazla toplu film isteği gönderildi. Lütfen daha sonra tekrar deneyin.",
        },
    });


/**
 * @swagger
 * tags:
 *   name: TMDB
 *   description: TMDB film verileri işlemleri
 */


/**
 * @swagger
 * /tmdb/trending:
 *   get:
 *     summary: Trend filmleri getirir
 *     tags: [TMDB]
 *     responses:
 *       200:
 *         description: Trend filmler başarıyla getirildi
 */
router.get(
    "/trending",
    tmdbController
        .getTrendingMovies
);


/**
 * @swagger
 * /tmdb/popular:
 *   get:
 *     summary: Popüler filmleri getirir
 *     tags: [TMDB]
 *     responses:
 *       200:
 *         description: Popüler filmler başarıyla getirildi
 */
router.get(
    "/popular",
    tmdbController
        .getPopularMovies
);


/**
 * @swagger
 * /tmdb/top-rated:
 *   get:
 *     summary: En yüksek puanlı filmleri getirir
 *     tags: [TMDB]
 *     responses:
 *       200:
 *         description: En yüksek puanlı filmler başarıyla getirildi
 */
router.get(
    "/top-rated",
    tmdbController
        .getTopRatedMovies
);


/**
 * @swagger
 * /tmdb/upcoming:
 *   get:
 *     summary: Yakında vizyona girecek filmleri getirir
 *     tags: [TMDB]
 *     responses:
 *       200:
 *         description: Yakında vizyona girecek filmler başarıyla getirildi
 */
router.get(
    "/upcoming",
    tmdbController
        .getUpcomingMovies
);


/**
 * @swagger
 * /tmdb/search:
 *   get:
 *     summary: Film araması yapar
 *     tags: [TMDB]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Aranacak film adı
 *         schema:
 *           type: string
 *         example: Interstellar
 *       - in: query
 *         name: page
 *         required: false
 *         description: Arama sonuçlarının sayfa numarası
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 2
 *     responses:
 *       200:
 *         description: Arama sonuçları ve pagination bilgileri başarıyla getirildi
 *       400:
 *         description: Arama sorgusu veya sayfa parametresi geçersiz
 */
router.get(
    "/search",
    validateRequest({
        query:
            movieSearchValidation,
    }),
    tmdbController.searchMovie
);


/**
 * @swagger
 * /tmdb/movies/batch:
 *   post:
 *     summary: Birden fazla filmin detaylarını toplu getirir
 *     tags: [TMDB]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieIds
 *             properties:
 *               movieIds:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 20
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example:
 *                   - 157336
 *                   - 27205
 *                   - 155
 *     responses:
 *       200:
 *         description: Film detayları başarıyla getirildi
 *       400:
 *         description: Film ID listesi geçersiz
 *       401:
 *         description: Yetkilendirme gerekli
 *       429:
 *         description: Çok fazla toplu film isteği
 *       502:
 *         description: TMDB servisine ulaşılamadı
 *       504:
 *         description: TMDB servisi zaman aşımına uğradı
 */
router.post(
    "/movies/batch",
    auth,
    tmdbBatchLimiter,
    validateRequest({
        body:
            movieBatchValidation,
    }),
    tmdbController
        .getMovieDetailsBatch
);


/**
 * @swagger
 * /tmdb/movie/{id}:
 *   get:
 *     summary: Film detaylarını getirir
 *     tags: [TMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: TMDB film ID'si
 *         schema:
 *           type: integer
 *         example: 157336
 *     responses:
 *       200:
 *         description: Film detayları başarıyla getirildi
 *       400:
 *         description: Geçersiz film ID'si
 *       404:
 *         description: Film bulunamadı
 */
router.get(
    "/movie/:id",
    validateRequest({
        params:
            tmdbIdValidation,
    }),
    tmdbController
        .getMovieDetails
);


/**
 * @swagger
 * /tmdb/movie/{id}/cast:
 *   get:
 *     summary: Filmin oyuncu kadrosunu getirir
 *     tags: [TMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: TMDB film ID'si
 *         schema:
 *           type: integer
 *         example: 157336
 *     responses:
 *       200:
 *         description: Film oyuncu kadrosu başarıyla getirildi
 *       400:
 *         description: Geçersiz film ID'si
 *       404:
 *         description: Film bulunamadı
 */
router.get(
    "/movie/:id/cast",
    validateRequest({
        params:
            tmdbIdValidation,
    }),
    tmdbController
        .getMovieCast
);


/**
 * @swagger
 * /tmdb/movie/{id}/trailers:
 *   get:
 *     summary: Filmin fragmanlarını getirir
 *     tags: [TMDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: TMDB film ID'si
 *         schema:
 *           type: integer
 *         example: 157336
 *     responses:
 *       200:
 *         description: Film fragmanları başarıyla getirildi
 *       400:
 *         description: Geçersiz film ID'si
 *       404:
 *         description: Film bulunamadı
 */
router.get(
    "/movie/:id/trailers",
    validateRequest({
        params:
            tmdbIdValidation,
    }),
    tmdbController
        .getMovieTrailers
);


module.exports = router;