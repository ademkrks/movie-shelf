// Express Router'ı içe aktarır
const express = require("express");

// Router oluşturur
const router = express.Router();

// Authentication middleware'i
const auth = require("../middleware/auth");

// Controller katmanı
const movieController = require("../controllers/movie.controller");

// Global validation middleware'i
const validateRequest = require("../middleware/validateRequest");

// Movie validation'ları
const {
    movieValidation,
    movieIdValidation,
} = require("../validations/movie.validation");

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Film yönetimi işlemleri
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Tüm filmleri getirir
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Filmler başarıyla getirildi
 */
router.get(
    "/",
    movieController.getMovies
);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: ID'ye göre film getirir
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Film ID'si
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Film başarıyla getirildi
 *       400:
 *         description: Geçersiz film ID'si
 *       404:
 *         description: Film bulunamadı
 */
router.get(
    "/:id",
    validateRequest({
        params: movieIdValidation,
    }),
    movieController.getMovieById
);

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Yeni film oluşturur
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 description: Film adı
 *                 example: Interstellar
 *               year:
 *                 type: integer
 *                 description: Filmin vizyon yılı
 *                 example: 2014
 *     responses:
 *       201:
 *         description: Film başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz film verisi
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.post(
    "/",
    auth,
    validateRequest({
        body: movieValidation,
    }),
    movieController.createMovie
);

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Filmi günceller
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Güncellenecek film ID'si
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
 *               - title
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 description: Film adı
 *                 example: Interstellar
 *               year:
 *                 type: integer
 *                 description: Filmin vizyon yılı
 *                 example: 2014
 *     responses:
 *       200:
 *         description: Film başarıyla güncellendi
 *       400:
 *         description: Geçersiz film verisi
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Film bulunamadı
 */
router.put(
    "/:id",
    auth,
    validateRequest({
        params: movieIdValidation,
        body: movieValidation,
    }),
    movieController.updateMovie
);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Filmi siler
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Silinecek film ID'si
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Film başarıyla silindi
 *       400:
 *         description: Geçersiz film ID'si
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Film bulunamadı
 */
router.delete(
    "/:id",
    auth,
    validateRequest({
        params: movieIdValidation,
    }),
    movieController.deleteMovie
);

// Router'ı dışa aktarır
module.exports = router;