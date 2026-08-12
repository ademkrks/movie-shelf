const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const env = require("../config/env");
const AppError = require("../utils/AppError");


// JWT ile kullanıcı yetkilendirmesi yapar
const auth = async (req, res, next) => {
    try {
        // Authorization header'ını alır
        const authHeader = req.headers.authorization;

        // Bearer token kontrolü
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            throw new AppError(
                "Yetkilendirme başarısız.",
                401
            );
        }

        // Token'ı ayıklar
        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(
                "Yetkilendirme başarısız.",
                401
            );
        }

        let decoded;

        try {
            // Token'ı doğrular
            decoded = jwt.verify(
                token,
                env.jwtSecret
            );
        } catch (error) {
            // Süresi dolmuş veya geçersiz token
            if (
                error.name === "TokenExpiredError" ||
                error.name === "JsonWebTokenError" ||
                error.name === "NotBeforeError"
            ) {
                throw new AppError(
                    "Geçersiz veya süresi dolmuş token.",
                    401
                );
            }

            throw error;
        }

        // Token içerisindeki kullanıcı ID'sini kontrol eder
        if (!decoded || !decoded.id) {
            throw new AppError(
                "Geçersiz yetkilendirme token'ı.",
                401
            );
        }

        // Kullanıcıyı veritabanında arar
        // Password alanı özellikle seçilmez
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        // Kullanıcı artık mevcut değilse
        if (!user) {
            throw new AppError(
                "Yetkilendirme başarısız.",
                401
            );
        }

        // Kullanıcıyı request nesnesine ekler
        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};


module.exports = auth;