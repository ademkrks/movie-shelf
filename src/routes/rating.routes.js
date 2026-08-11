const express = require("express");
const router = express.Router();

const ratingController = require("../controllers/rating.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Film puanlama işlemleri
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Filme puan ekler
 *     tags: [Ratings]
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
 *               - rating
 *             properties:
 *               tmdbMovieId:
 *                 type: integer
 *                 example: 157336
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 9
 *     responses:
 *       201:
 *         description: Film başarıyla puanlandı
 *       400:
 *         description: Geçersiz puan veya film zaten puanlanmış
 */
router.post(
    "/",
    auth,
    ratingController.addRating
);

/**
 * @swagger
 * /ratings/movie/{tmdbMovieId}:
 *   get:
 *     summary: Filmin puanlarını getirir
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: tmdbMovieId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 157336
 *     responses:
 *       200:
 *         description: Film puanları başarıyla getirildi
 */
router.get(
    "/movie/:tmdbMovieId",
    ratingController.getMovieRatings
);

/**
 * @swagger
 * /ratings/{id}:
 *   put:
 *     summary: Kullanıcının film puanını günceller
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 8
 *     responses:
 *       200:
 *         description: Film puanı güncellendi
 *       403:
 *         description: Kullanıcının bu puanı güncelleme yetkisi yok
 *       404:
 *         description: Puan bulunamadı
 */
router.put(
    "/:id",
    auth,
    ratingController.updateRating
);

/**
 * @swagger
 * /ratings/{id}:
 *   delete:
 *     summary: Kullanıcının film puanını siler
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Film puanı silindi
 *       403:
 *         description: Kullanıcının bu puanı silme yetkisi yok
 *       404:
 *         description: Puan bulunamadı
 */
router.delete(
    "/:id",
    auth,
    ratingController.deleteRating
);

module.exports = router;