const express = require("express");

const router = express.Router();

const watchlistController = require(
    "../controllers/watchlist.controller"
);

const auth = require(
    "../middleware/auth"
);

const validateRequest = require(
    "../middleware/validateRequest"
);

const {
    tmdbMovieIdValidation,
    tmdbMovieBodyValidation,
    paginationValidation,
} = require(
    "../validations/common.validation"
);


/**
 * @swagger
 * tags:
 *   name: Watchlist
 *   description: Film izleme listesi işlemleri
 */


/**
 * @swagger
 * /watchlist:
 *   post:
 *     summary: Filmi izleme listesine ekler
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tmdbMovieId
 *             properties:
 *               tmdbMovieId:
 *                 type: integer
 *                 description: TMDB film ID'si
 *                 example: 157336
 *     responses:
 *       201:
 *         description: Film izleme listesine başarıyla eklendi
 *       400:
 *         description: Geçersiz film ID'si veya film zaten izleme listesinde
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.post(
    "/",
    auth,
    validateRequest({
        body: tmdbMovieBodyValidation,
    }),
    watchlistController.addWatchlist
);


/**
 * @swagger
 * /watchlist:
 *   get:
 *     summary: Kullanıcının izleme listesini sayfalı getirir
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Sayfa numarası
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Sayfa başına kayıt sayısı
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         example: 20
 *     responses:
 *       200:
 *         description: İzleme listesi ve pagination bilgileri başarıyla getirildi
 *       400:
 *         description: Geçersiz pagination parametreleri
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get(
    "/",
    auth,
    validateRequest({
        query: paginationValidation,
    }),
    watchlistController.getWatchlist
);


/**
 * @swagger
 * /watchlist/{tmdbMovieId}/status:
 *   get:
 *     summary: Filmin kullanıcının izleme listesinde olup olmadığını kontrol eder
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbMovieId
 *         required: true
 *         description: TMDB film ID'si
 *         schema:
 *           type: integer
 *         example: 157336
 *     responses:
 *       200:
 *         description: İzleme listesi durumu başarıyla getirildi
 *       400:
 *         description: Geçersiz TMDB film ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get(
    "/:tmdbMovieId/status",
    auth,
    validateRequest({
        params: tmdbMovieIdValidation,
    }),
    watchlistController.getWatchlistStatus
);


/**
 * @swagger
 * /watchlist/{tmdbMovieId}:
 *   delete:
 *     summary: Filmi izleme listesinden kaldırır
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbMovieId
 *         required: true
 *         description: TMDB film ID'si
 *         schema:
 *           type: integer
 *         example: 157336
 *     responses:
 *       200:
 *         description: Film izleme listesinden başarıyla kaldırıldı
 *       400:
 *         description: Geçersiz TMDB film ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Film izleme listesinde bulunamadı
 */
router.delete(
    "/:tmdbMovieId",
    auth,
    validateRequest({
        params: tmdbMovieIdValidation,
    }),
    watchlistController.removeWatchlist
);


module.exports = router;