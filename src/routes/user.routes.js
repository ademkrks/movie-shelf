const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const userController = require("../controllers/user.controller");

const validateRequest = require("../middleware/validateRequest");

const {
    updateProfileValidation,
} = require("../validations/user.validation");


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı profil işlemleri
 */


/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Giriş yapan kullanıcının profilini getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili başarıyla getirildi
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get(
    "/me",
    auth,
    userController.getProfile
);


/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Giriş yapan kullanıcının profilini günceller
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kullanıcının yeni adı
 *                 example: Ali Demir
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcının yeni e-posta adresi
 *                 example: ali@example.com
 *     responses:
 *       200:
 *         description: Kullanıcı profili başarıyla güncellendi
 *       400:
 *         description: Geçersiz kullanıcı bilgileri
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put(
    "/me",
    auth,
    validateRequest({
        body: updateProfileValidation,
    }),
    userController.updateProfile
);


module.exports = router;