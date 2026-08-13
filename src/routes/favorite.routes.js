const express = require("express");

const router = express.Router();

const favoriteController = require(
    "../controllers/favorite.controller"
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
 *   name: Favorites
 *   description: Film favori işlemleri
 */


/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Filmi favorilere ekler
 *     tags: [Favorites]
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
 *         description: Film favorilere başarıyla eklendi
 *       400:
 *         description: Geçersiz film ID'si veya film zaten favorilerde
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.post(
    "/",
    auth,
    validateRequest({
        body: tmdbMovieBodyValidation,
    }),
    favoriteController.addFavorite
);


/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Kullanıcının favori filmlerini sayfalı getirir
 *     tags: [Favorites]
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
 *         description: Favori filmler ve pagination bilgileri başarıyla getirildi
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
    favoriteController.getFavorites
);


/**
 * @swagger
 * /favorites/{tmdbMovieId}:
 *   delete:
 *     summary: Filmi favorilerden kaldırır
 *     tags: [Favorites]
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
 *         description: Film favorilerden başarıyla kaldırıldı
 *       400:
 *         description: Geçersiz TMDB film ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Favori kayıt bulunamadı
 */
router.delete(
    "/:tmdbMovieId",
    auth,
    validateRequest({
        params: tmdbMovieIdValidation,
    }),
    favoriteController.removeFavorite
);


module.exports = router;