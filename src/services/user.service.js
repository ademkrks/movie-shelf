const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

const AppError = require("../utils/AppError");


// Giriş yapan kullanıcının profilini getirir
const getProfile = async (userId) => {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });
};


// Profil bilgilerini günceller
const updateProfile = async (userId, data) => {
    const updateData = {};

    // Sadece gönderilen alanları günceller
    if (data.name !== undefined) {
        updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
        updateData.email = data.email
            .trim()
            .toLowerCase();
    }

    return await prisma.user.update({
        where: {
            id: userId,
        },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });
};


// Kullanıcının şifresini değiştirir
const changePassword = async (
    userId,
    currentPassword,
    newPassword
) => {
    // Şifre doğrulaması için mevcut kullanıcıyı getirir
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            password: true,
        },
    });

    if (!user) {
        throw new AppError(
            "Kullanıcı bulunamadı.",
            404
        );
    }

    // Mevcut şifreyi doğrular
    const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!passwordMatch) {
        throw new AppError(
            "Mevcut şifre hatalı.",
            401
        );
    }

    // Aynı şifrenin tekrar kullanılmasını engeller
    if (currentPassword === newPassword) {
        throw new AppError(
            "Yeni şifre mevcut şifre ile aynı olamaz.",
            400
        );
    }

    // Yeni şifreyi hashler
    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    /*
     * Şifre değiştirilir.
     *
     * tokenVersion artırılarak mevcut JWT dahil
     * daha önce oluşturulmuş JWT'ler geçersiz olur.
     *
     * Açık password reset tokenları da silinir.
     */
    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
                tokenVersion: {
                    increment: 1,
                },
            },
        }),

        prisma.passwordResetToken.deleteMany({
            where: {
                userId,
            },
        }),
    ]);

    return null;
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};