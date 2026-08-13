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

        /*
         * Kullanıcı DB'den bulunur.
         *
         * password seçilmez.
         * role yetkilendirme kontrolü için kullanılır.
         * tokenVersion eski JWT'leri iptal etmek için kullanılır.
         */
        const user =
            await prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
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
         * Eski JWT'lerde tokenVersion bulunmuyorsa
         * sürüm 0 kabul edilir.
         */
        const tokenVersion =
            Number.isInteger(
                decoded.tokenVersion
            )
                ? decoded.tokenVersion
                : 0;

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
         * Uygulamanın kullandığı kullanıcı bilgileri.
         *
         * role burada özellikle tutulmaz.
         * Yetkilendirme bilgisi req.auth altında tutulur.
         */
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        };

        /*
         * Yetkilendirme bilgileri ayrı tutulur.
         * Kullanıcı rolü JWT'den değil DB'den gelir.
         */
        req.auth = {
            role: user.role || "USER",
        };

        next();
    } catch (error) {
        next(error);
    }
};


module.exports = auth;