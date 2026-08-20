const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");
const emailService = require("./email.service");


// Timing attack riskini azaltmak için kullanılan sabit hash.
// Gerçek bir kullanıcı parolası değildir.
const DUMMY_PASSWORD_HASH =
    "$2b$10$WUWZz/cGkVo4XjhqqV9Cq.PgqcZnt3KqFloBn3tFjcPINGGTO/NvS";


// Password reset token geçerlilik süresi
const PASSWORD_RESET_EXPIRES_IN =
    15 * 60 * 1000;


// Yeni kullanıcı oluşturur
const register = async (data) => {
    const {
        name,
        email,
        password,
    } = data;

    // Temel alan kontrolü
    if (
        !name ||
        !email ||
        !password
    ) {
        throw new AppError(
            "Ad, e-posta ve şifre alanları zorunludur.",
            400
        );
    }

    // İsim kontrolü
    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        throw new AppError(
            "Ad alanı geçerli olmalıdır.",
            400
        );
    }

    // E-posta normalize edilir
    const normalizedEmail =
        email
            .trim()
            .toLowerCase();

    // E-posta formatı
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailRegex.test(
            normalizedEmail
        )
    ) {
        throw new AppError(
            "Geçerli bir e-posta adresi giriniz.",
            400
        );
    }

    // Minimum parola uzunluğu
    if (
        password.length < 8
    ) {
        throw new AppError(
            "Şifre en az 8 karakter olmalıdır.",
            400
        );
    }

    // Aynı e-posta kayıtlı mı kontrol eder
    const existingUser =
        await prisma.user.findUnique({
            where: {
                email:
                    normalizedEmail,
            },
        });

    if (
        existingUser
    ) {
        throw new AppError(
            "Bu e-posta adresi zaten kayıtlı.",
            400
        );
    }

    // Şifreyi hashler
    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    // Kullanıcıyı oluşturur
    const user =
        await prisma.user.create({
            data: {
                name:
                    name.trim(),

                email:
                    normalizedEmail,

                password:
                    hashedPassword,
            },

            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

    return user;
};


// Kullanıcı girişi
const login = async (data) => {
    const {
        email,
        password,
    } = data;

    // Temel alan kontrolü
    if (
        !email ||
        !password
    ) {
        throw new AppError(
            "E-posta ve şifre zorunludur.",
            400
        );
    }

    // E-posta normalize edilir
    const normalizedEmail =
        email
            .trim()
            .toLowerCase();

    // E-posta formatı
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailRegex.test(
            normalizedEmail
        )
    ) {
        throw new AppError(
            "Geçerli bir e-posta adresi giriniz.",
            400
        );
    }

    // Kullanıcıyı e-posta ile bulur
    const user =
        await prisma.user.findUnique({
            where: {
                email:
                    normalizedEmail,
            },
        });

    /*
     * Kullanıcı bulunamadığında da bcrypt
     * çalıştırılarak timing farkı azaltılır.
     */
    if (
        !user
    ) {
        await bcrypt.compare(
            password,
            DUMMY_PASSWORD_HASH
        );

        throw new AppError(
            "E-posta veya şifre hatalı.",
            401
        );
    }

    // Şifreyi doğrular
    const passwordMatch =
        await bcrypt.compare(
            password,
            user.password
        );

    if (
        !passwordMatch
    ) {
        throw new AppError(
            "E-posta veya şifre hatalı.",
            401
        );
    }

    // Güncel tokenVersion ile JWT oluşturur
    const token =
        generateToken(
            user.id,
            user.tokenVersion ?? 0
        );

    // API cevabında password gönderilmez
    const safeUser = {
        id:
            user.id,

        name:
            user.name,

        email:
            user.email,

        createdAt:
            user.createdAt,
    };

    return {
        user:
            safeUser,

        token,
    };
};


// Şifre sıfırlama isteği oluşturur
const forgotPassword = async (
    data
) => {
    const normalizedEmail =
        data.email
            .trim()
            .toLowerCase();

    // Kullanıcıyı bulur
    const user =
        await prisma.user.findUnique({
            where: {
                email:
                    normalizedEmail,
            },

            select: {
                id: true,
                email: true,
            },
        });

    /*
     * Kullanıcı yoksa bilgi sızdırmadan
     * işlem sonlandırılır.
     */
    if (
        !user
    ) {
        return null;
    }

    // Güvenli reset token oluşturur
    const resetToken =
        crypto
            .randomBytes(32)
            .toString("hex");

    // Gerçek token yerine hash'i DB'de tutulur
    const tokenHash =
        crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

    // Token 15 dakika geçerlidir
    const expiresAt =
        new Date(
            Date.now() +
                PASSWORD_RESET_EXPIRES_IN
        );

    // Eski tokenları siler ve yenisini oluşturur
    await prisma.$transaction([
        prisma.passwordResetToken
            .deleteMany({
                where: {
                    userId:
                        user.id,
                },
            }),

        prisma.passwordResetToken
            .create({
                data: {
                    userId:
                        user.id,

                    tokenHash,

                    expiresAt,
                },
            }),
    ]);

    try {
        /*
         * Gerçek token yalnızca e-posta
         * servisine gönderilir.
         */
        await emailService
            .sendPasswordResetEmail(
                user.email,
                resetToken
            );
    } catch (error) {
        /*
         * Mail gönderilemezse oluşturulan
         * token temizlenir.
         */
        await prisma.passwordResetToken
            .deleteMany({
                where: {
                    userId:
                        user.id,

                    tokenHash,
                },
            });

        // Test ortamında terminal çıktısını kirletmez
        if (
            process.env.NODE_ENV !==
            "test"
        ) {
            console.error(
                "Password reset email error:",
                error.message
            );
        }

        /*
         * Kullanıcının sistemde kayıtlı olup
         * olmadığı response üzerinden
         * anlaşılmasın diye hata dışarı aktarılmaz.
         */
        return null;
    }

    return null;
};


// Kullanıcının şifresini sıfırlar
const resetPassword = async (
    data
) => {
    const {
        token,
        password,
    } = data;

    // Yeni şifre kontrolü
    if (
        typeof password !==
            "string" ||
        password.length < 8
    ) {
        throw new AppError(
            "Yeni şifre en az 8 karakter olmalıdır.",
            400
        );
    }

    // Gelen token tekrar hashlenir
    const tokenHash =
        crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

    // Token DB'de aranır
    const passwordResetToken =
        await prisma
            .passwordResetToken
            .findUnique({
                where: {
                    tokenHash,
                },
            });

    // Token bulunamadı
    if (
        !passwordResetToken
    ) {
        throw new AppError(
            "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
            400
        );
    }

    // Token süresi dolmuş
    if (
        passwordResetToken
            .expiresAt <=
        new Date()
    ) {
        /*
         * deleteMany kullanılarak aynı expired
         * token için eşzamanlı cleanup istekleri
         * güvenli şekilde karşılanır.
         */
        await prisma
            .passwordResetToken
            .deleteMany({
                where: {
                    id:
                        passwordResetToken
                            .id,

                    tokenHash,
                },
            });

        throw new AppError(
            "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
            400
        );
    }

    // Yeni şifre transaction öncesinde hashlenir
    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    /*
     * Token atomik olarak tüketilir.
     *
     * Aynı reset token ile iki eşzamanlı
     * istek gelirse yalnızca biri token
     * kaydını silebilir ve count = 1 alır.
     *
     * Diğer istek count = 0 alır ve
     * şifreyi değiştiremeden reddedilir.
     */
    await prisma.$transaction(
        async (transaction) => {
            const transactionTime =
                new Date();

            const consumedToken =
                await transaction
                    .passwordResetToken
                    .deleteMany({
                        where: {
                            id:
                                passwordResetToken
                                    .id,

                            tokenHash,

                            expiresAt: {
                                gt:
                                    transactionTime,
                            },
                        },
                    });

            /*
             * Token başka bir istek tarafından
             * tüketilmiş veya transaction
             * başlayana kadar süresi dolmuşsa
             * işlem devam etmez.
             */
            if (
                consumedToken.count !==
                1
            ) {
                throw new AppError(
                    "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
                    400
                );
            }

            /*
             * Şifre güncellenir.
             *
             * tokenVersion artırılarak kullanıcıya
             * daha önce verilmiş JWT'ler geçersiz
             * hale getirilir.
             */
            await transaction
                .user
                .update({
                    where: {
                        id:
                            passwordResetToken
                                .userId,
                    },

                    data: {
                        password:
                            hashedPassword,

                        tokenVersion: {
                            increment: 1,
                        },
                    },
                });

            /*
             * Kullanıcıya ait varsa diğer açık
             * reset tokenları da temizlenir.
             */
            await transaction
                .passwordResetToken
                .deleteMany({
                    where: {
                        userId:
                            passwordResetToken
                                .userId,
                    },
                });
        }
    );

    return null;
};


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
};