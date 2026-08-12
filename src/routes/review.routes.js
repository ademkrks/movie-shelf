const express = require("express");

const router = express.Router();

const reviewController = require("../controllers/review.controller");
const auth = require("../middleware/auth");

const validateRequest = require("../middleware/validateRequest");

const {
    reviewBodyValidation,
    reviewUpdateValidation,
    reviewIdValidation,
    reviewMovieIdValidation,
} = require("../validations/review.validation");


/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Film yorumları işlemleri
 */


/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Filme yorum ekler
 *     tags: [Reviews]
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
 *               - content
 *             properties:
 *               tmdbMovieId:
 *                 type: integer
 *                 description: TMDB film ID'si
 *                 example: 157336
 *               content:
 *                 type: string
 *                 description: Film yorumu
 *                 example: Muhteşem bir bilim kurgu filmi.
 *     responses:
 *       201:
 *         description: Yorum başarıyla eklendi
 *       400:
 *         description: Geçersiz yorum verisi
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.post(
    "/",
    auth,
    validateRequest({
        body: reviewBodyValidation,
    }),
    reviewController.addReview
);


/**
 * @swagger
 * /reviews/movie/{tmdbMovieId}:
 *   get:
 *     summary: Filmin yorumlarını getirir
 *     tags: [Reviews]
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
 *         description: Film yorumları başarıyla getirildi
 *       400:
 *         description: Geçersiz TMDB film ID'si
 *       404:
 *         description: Film yorumları bulunamadı
 */
router.get(
    "/movie/:tmdbMovieId",
    validateRequest({
        params: reviewMovieIdValidation,
    }),
    reviewController.getMovieReviews
);


/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Kullanıcının yorumunu günceller
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Yorum ID'si
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Güncellenmiş yorum
 *                 example: Filmi tekrar izledim ve hâlâ çok başarılı buluyorum.
 *     responses:
 *       200:
 *         description: Yorum başarıyla güncellendi
 *       400:
 *         description: Geçersiz yorum verisi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Kullanıcının bu yorumu güncelleme yetkisi yok
 *       404:
 *         description: Yorum bulunamadı
 */
router.put(
    "/:id",
    auth,
    validateRequest({
        params: reviewIdValidation,
        body: reviewUpdateValidation,
    }),
    reviewController.updateReview
);


/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Kullanıcının yorumunu siler
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Yorum ID'si
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Yorum başarıyla silindi
 *       400:
 *         description: Geçersiz yorum ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Kullanıcının bu yorumu silme yetkisi yok
 *       404:
 *         description: Yorum bulunamadı
 */
router.delete(
    "/:id",
    auth,
    validateRequest({
        params: reviewIdValidation,
    }),
    reviewController.deleteReview
);


module.exports = router;