const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const userController = require(
    "../controllers/user.controller"
);

const validateRequest = require(
    "../middleware/validateRequest"
);

const {
    updateProfileValidation,
    changePasswordValidation,
} = require("../validations/user.validation");


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı profil ve hesap işlemleri
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


/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Giriş yapan kullanıcının şifresini değiştirir
 *     description: Şifre değiştirildiğinde mevcut JWT dahil önceki oturumlar geçersiz hale gelir.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcının mevcut şifresi
 *                 example: MevcutSifre123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Kullanıcının yeni şifresi
 *                 example: YeniGucluSifre456
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *       400:
 *         description: Geçersiz şifre bilgileri veya yeni şifre mevcut şifre ile aynı
 *       401:
 *         description: Yetkilendirme gerekli veya mevcut şifre hatalı
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put(
    "/change-password",
    auth,
    validateRequest({
        body: changePasswordValidation,
    }),
    userController.changePassword
);


module.exports = router;