const express = require("express");

const router = express.Router();

const watchlistController = require("../controllers/watchlist.controller");
const auth = require("../middleware/auth");

const validateRequest = require("../middleware/validateRequest");

const {
    tmdbMovieIdValidation,
    tmdbMovieBodyValidation,
} = require("../validations/common.validation");


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
 *     summary: Kullanıcının izleme listesini getirir
 *     tags: [Watchlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İzleme listesi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get(
    "/",
    auth,
    watchlistController.getWatchlist
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