const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

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
 *                 description: Kullanıcının adı
 *                 example: Ali Demir
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcının e-posta adresi
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcının şifresi
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz kullanıcı bilgileri
 */
router.post(
    "/register",
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
 *                 description: Kullanıcının e-posta adresi
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcının şifresi
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Kullanıcı girişi başarılı
 *       401:
 *         description: E-posta veya şifre hatalı
 */
router.post(
    "/login",
    authController.login
);

module.exports = router;