const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favorite.controller");
const auth = require("../middleware/auth");

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
 *                 example: 157336
 *     responses:
 *       201:
 *         description: Film favorilere başarıyla eklendi
 *       400:
 *         description: Film zaten favorilerde
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.post(
    "/",
    auth,
    favoriteController.addFavorite
);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Kullanıcının favori filmlerini getirir
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favori filmler başarıyla getirildi
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get(
    "/",
    auth,
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
 *       404:
 *         description: Favori kayıt bulunamadı
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.delete(
    "/:tmdbMovieId",
    auth,
    favoriteController.removeFavorite
);

module.exports = router;