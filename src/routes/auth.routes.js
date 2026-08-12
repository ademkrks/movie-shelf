const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");

const validateRequest = require("../middleware/validateRequest");

const {
    registerValidation,
    loginValidation,
} = require("../validations/auth.validation");

// Authentication işlemleri için sıkı rate limit
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        status: "error",
        message:
            "Çok fazla giriş veya kayıt denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.",
    },
});

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Kullanıcı kayıt ve giriş işlemleri
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Demir
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz kullanıcı bilgileri
 */
router.post(
    "/register",
    authLimiter,
    validateRequest({
        body: registerValidation,
    }),
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi yapar
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Kullanıcı girişi başarılı
 *       401:
 *         description: E-posta veya şifre hatalı
 */
router.post(
    "/login",
    authLimiter,
    validateRequest({
        body: loginValidation,
    }),
    authController.login
);

module.exports = router;