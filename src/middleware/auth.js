const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const env = require("../config/env");
const AppError = require("../utils/AppError");


// JWT ile kullanıcı yetkilendirmesi yapar
const auth = async (req, res, next) => {
    try {
        // Authorization header'ını alır
        const authHeader =
            req.headers.authorization;

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
        const token =
            authHeader.split(" ")[1];

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
                error.name ===
                    "TokenExpiredError" ||
                error.name ===
                    "JsonWebTokenError" ||
                error.name ===
                    "NotBeforeError"
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
        const user =
            await prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    tokenVersion: true,
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

        /*
         * Eski JWT'lerde tokenVersion alanı
         * bulunmayabilir. Bu tokenlar sürüm 0
         * olarak kabul edilir.
         */
        const tokenVersion =
            Number.isInteger(
                decoded.tokenVersion
            )
                ? decoded.tokenVersion
                : 0;

        /*
         * Testler ve migration öncesi uyumluluk
         * için eksik değer 0 kabul edilir.
         */
        const currentTokenVersion =
            Number.isInteger(
                user.tokenVersion
            )
                ? user.tokenVersion
                : 0;

        // Password reset sonrası eski JWT'leri reddeder
        if (
            tokenVersion !==
            currentTokenVersion
        ) {
            throw new AppError(
                "Geçersiz veya süresi dolmuş token.",
                401
            );
        }

        /*
         * tokenVersion yalnızca güvenlik
         * kontrolünde kullanılır.
         * Request üzerindeki kullanıcı verisine
         * eklenmez.
         */
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };

        next();
    } catch (error) {
        next(error);
    }
};


module.exports = auth;