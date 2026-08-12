const express = require("express");

const router = express.Router();

const tmdbController = require("../controllers/tmdb.controller");

const validateRequest = require("../middleware/validateRequest");

const {
    tmdbIdValidation,
    movieSearchValidation,
} = require("../validations/tmdb.validation");


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
    tmdbController.getTrendingMovies
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
    tmdbController.getPopularMovies
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
    tmdbController.getTopRatedMovies
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
    tmdbController.getUpcomingMovies
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
 *     responses:
 *       200:
 *         description: Arama sonuçları başarıyla getirildi
 *       400:
 *         description: Arama sorgusu gerekli veya geçersiz
 */
router.get(
    "/search",
    validateRequest({
        query: movieSearchValidation,
    }),
    tmdbController.searchMovie
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
        params: tmdbIdValidation,
    }),
    tmdbController.getMovieDetails
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
        params: tmdbIdValidation,
    }),
    tmdbController.getMovieCast
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
        params: tmdbIdValidation,
    }),
    tmdbController.getMovieTrailers
);


module.exports = router;