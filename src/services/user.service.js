const prisma = require("../config/prisma");

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

    // Sadece gönderilen alanları güncelle
    if (data.name !== undefined) {
        updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
        updateData.email = data.email.trim().toLowerCase();
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


module.exports = {
    getProfile,
    updateProfile,
};