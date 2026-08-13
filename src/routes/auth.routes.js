const express = require("express");
const rateLimit = require("express-rate-limit");

const authController = require(
    "../controllers/auth.controller"
);

const validateRequest = require(
    "../middleware/validateRequest"
);

const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require(
    "../validations/auth.validation"
);


const router = express.Router();


// Auth endpointleri için rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        status: "error",
        message:
            "Çok fazla kimlik doğrulama isteği gönderildi. Lütfen 15 dakika sonra tekrar deneyin.",
    },
});


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags:
 *       - Auth
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
 *                 example: Ali
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: gucluSifre123
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       429:
 *         description: Çok fazla istek
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
 *     tags:
 *       - Auth
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
 *                 example: gucluSifre123
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: E-posta veya şifre hatalı
 *       429:
 *         description: Çok fazla istek
 */
router.post(
    "/login",
    authLimiter,
    validateRequest({
        body: loginValidation,
    }),
    authController.login
);


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Şifre sıfırlama bağlantısı ister
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ali@example.com
 *     responses:
 *       200:
 *         description: Şifre sıfırlama isteği işlendi
 *       400:
 *         description: Geçersiz istek
 *       429:
 *         description: Çok fazla istek
 */
router.post(
    "/forgot-password",
    authLimiter,
    validateRequest({
        body: forgotPasswordValidation,
    }),
    authController.forgotPassword
);


/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset token ile kullanıcı şifresini değiştirir
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: E-postada bulunan 64 karakterlik reset token
 *                 example: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
 *               password:
 *                 type: string
 *                 format: password
 *                 example: yeniGucluSifre123
 *     responses:
 *       200:
 *         description: Şifre başarıyla güncellendi
 *       400:
 *         description: Token geçersiz, süresi dolmuş veya istek hatalı
 *       429:
 *         description: Çok fazla istek
 */
router.post(
    "/reset-password",
    authLimiter,
    validateRequest({
        body: resetPasswordValidation,
    }),
    authController.resetPassword
);


module.exports = router;