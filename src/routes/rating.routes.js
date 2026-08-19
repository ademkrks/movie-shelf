const express = require("express");

const router = express.Router();

const ratingController = require(
    "../controllers/rating.controller"
);

const auth = require(
    "../middleware/auth"
);

const validateRequest = require(
    "../middleware/validateRequest"
);

const {
    ratingBodyValidation,
    ratingIdValidation,
    ratingMovieIdValidation,
    ratingUpdateValidation,
} = require(
    "../validations/rating.validation"
);

const {
    paginationValidation,
} = require(
    "../validations/common.validation"
);


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
 *                 description: TMDB film ID'si
 *                 example: 157336
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Filme verilen puan
 *                 example: 9
 *     responses:
 *       201:
 *         description: Film başarıyla puanlandı
 *       400:
 *         description: Geçersiz puan veya film zaten puanlanmış
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.post(
    "/",
    auth,
    validateRequest({
        body: ratingBodyValidation,
    }),
    ratingController.addRating
);


/**
 * @swagger
 * /ratings/movie/{tmdbMovieId}/me:
 *   get:
 *     summary: Kullanıcının filme verdiği kendi puanını getirir
 *     tags: [Ratings]
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
 *         description: Kullanıcının film puanı getirildi; puan yoksa data null döner
 *       400:
 *         description: Geçersiz TMDB film ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get(
    "/movie/:tmdbMovieId/me",
    auth,
    validateRequest({
        params: ratingMovieIdValidation,
    }),
    ratingController.getMyRating
);


/**
 * @swagger
 * /ratings/movie/{tmdbMovieId}:
 *   get:
 *     summary: Filmin puanlarını sayfalı getirir
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: tmdbMovieId
 *         required: true
 *         description: TMDB film ID'si
 *         schema:
 *           type: integer
 *         example: 157336
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
 *         description: Sayfa başına puan kaydı sayısı
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         example: 20
 *     responses:
 *       200:
 *         description: Film puanları, genel istatistikler ve pagination bilgileri başarıyla getirildi
 *       400:
 *         description: Geçersiz TMDB film ID'si veya pagination parametreleri
 */
router.get(
    "/movie/:tmdbMovieId",
    validateRequest({
        params: ratingMovieIdValidation,
        query: paginationValidation,
    }),
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
 *         description: Puan ID'si
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
 *       400:
 *         description: Geçersiz puan
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Kullanıcının bu puanı güncelleme yetkisi yok
 *       404:
 *         description: Puan bulunamadı
 */
router.put(
    "/:id",
    auth,
    validateRequest({
        params: ratingIdValidation,
        body: ratingUpdateValidation,
    }),
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
 *         description: Puan ID'si
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Film puanı silindi
 *       400:
 *         description: Geçersiz puan ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Kullanıcının bu puanı silme yetkisi yok
 *       404:
 *         description: Puan bulunamadı
 */
router.delete(
    "/:id",
    auth,
    validateRequest({
        params: ratingIdValidation,
    }),
    ratingController.deleteRating
);


module.exports = router;