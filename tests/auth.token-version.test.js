const crypto = require("crypto");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },

    passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },

    $transaction: jest.fn(),
}));


// Gerçek e-posta gönderimini engeller
jest.mock(
    "../src/services/email.service",
    () => ({
        sendPasswordResetEmail:
            jest.fn(),
    })
);


const prisma =
    require("../src/config/prisma");

const auth =
    require("../src/middleware/auth");

const authService =
    require("../src/services/auth.service");


describe(
    "JWT Token Version Security",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();

            /*
             * Prisma'nın hem array transaction
             * hem interactive callback transaction
             * kullanımını mocklar.
             */
            prisma.$transaction
                .mockImplementation(
                    async (
                        transactionInput
                    ) => {
                        if (
                            typeof transactionInput ===
                            "function"
                        ) {
                            return transactionInput(
                                prisma
                            );
                        }

                        return Promise.all(
                            transactionInput
                        );
                    }
                );
        });


        test(
            "auth - güncel tokenVersion değerine sahip JWT'yi kabul etmeli",
            async () => {
                const token =
                    jwt.sign(
                        {
                            id: 1,
                            tokenVersion: 2,
                        },
                        process.env.JWT_SECRET,
                        {
                            algorithm:
                                "HS256",

                            expiresIn:
                                "1h",
                        }
                    );

                prisma.user.findUnique
                    .mockResolvedValue({
                        id: 1,
                        name: "Ali",
                        email:
                            "ali@example.com",
                        role: "USER",
                        tokenVersion: 2,
                        createdAt:
                            new Date(
                                "2026-08-13T10:00:00.000Z"
                            ),
                    });

                const req = {
                    headers: {
                        authorization:
                            `Bearer ${token}`,
                    },
                };

                const res = {};
                const next =
                    jest.fn();

                await auth(
                    req,
                    res,
                    next
                );

                expect(
                    prisma.user.findUnique
                ).toHaveBeenCalledWith({
                    where: {
                        id: 1,
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

                expect(
                    next
                ).toHaveBeenCalledTimes(
                    1
                );

                expect(
                    next
                ).toHaveBeenCalledWith();

                // tokenVersion kullanıcı verisine taşınmaz
                expect(
                    req.user
                ).toEqual({
                    id: 1,
                    name: "Ali",
                    email:
                        "ali@example.com",

                    createdAt:
                        new Date(
                            "2026-08-13T10:00:00.000Z"
                        ),
                });

                expect(
                    req.user.tokenVersion
                ).toBeUndefined();

                // Rol ayrı authorization alanında tutulur
                expect(
                    req.auth
                ).toEqual({
                    role: "USER",
                });
            }
        );


        test(
            "auth - eski tokenVersion değerine sahip JWT'yi 401 ile reddetmeli",
            async () => {
                /*
                 * Kullanıcı password reset öncesinde
                 * tokenVersion 0 ile JWT almış olsun.
                 */
                const oldToken =
                    jwt.sign(
                        {
                            id: 1,
                            tokenVersion: 0,
                        },
                        process.env.JWT_SECRET,
                        {
                            algorithm:
                                "HS256",

                            expiresIn:
                                "1h",
                        }
                    );

                /*
                 * Password reset sonrasında DB'deki
                 * tokenVersion 1 olmuş olsun.
                 */
                prisma.user.findUnique
                    .mockResolvedValue({
                        id: 1,
                        name: "Ali",
                        email:
                            "ali@example.com",
                        role: "USER",
                        tokenVersion: 1,
                        createdAt:
                            new Date(),
                    });

                const req = {
                    headers: {
                        authorization:
                            `Bearer ${oldToken}`,
                    },
                };

                const res = {};
                const next =
                    jest.fn();

                await auth(
                    req,
                    res,
                    next
                );

                expect(
                    next
                ).toHaveBeenCalledTimes(
                    1
                );

                const error =
                    next.mock.calls[0][0];

                expect(
                    error
                ).toMatchObject({
                    statusCode:
                        401,

                    message:
                        "Geçersiz veya süresi dolmuş token.",
                });

                expect(
                    req.user
                ).toBeUndefined();

                expect(
                    req.auth
                ).toBeUndefined();
            }
        );


        test(
            "resetPassword - şifre değiştiğinde tokenVersion değerini artırmalı",
            async () => {
                const resetToken =
                    "d".repeat(64);

                const tokenHash =
                    crypto
                        .createHash(
                            "sha256"
                        )
                        .update(
                            resetToken
                        )
                        .digest(
                            "hex"
                        );

                prisma
                    .passwordResetToken
                    .findUnique
                    .mockResolvedValue({
                        id: 10,
                        userId: 1,
                        tokenHash,

                        expiresAt:
                            new Date(
                                Date.now() +
                                    10 *
                                        60 *
                                        1000
                            ),
                    });

                /*
                 * İlk deleteMany tokenı atomik olarak tüketir.
                 * İkinci deleteMany diğer reset tokenlarını temizler.
                 */
                prisma
                    .passwordResetToken
                    .deleteMany
                    .mockResolvedValueOnce({
                        count: 1,
                    })
                    .mockResolvedValueOnce({
                        count: 0,
                    });

                prisma.user.update
                    .mockResolvedValue({
                        id: 1,
                    });

                const result =
                    await authService
                        .resetPassword({
                            token:
                                resetToken,

                            password:
                                "YeniGucluSifre123",
                        });

                expect(
                    result
                ).toBeNull();

                expect(
                    prisma.$transaction
                ).toHaveBeenCalledTimes(
                    1
                );

                /*
                 * Reset token transaction içinde
                 * atomik olarak tüketilmelidir.
                 */
                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenNthCalledWith(
                    1,
                    {
                        where: {
                            id: 10,
                            tokenHash,

                            expiresAt: {
                                gt:
                                    expect
                                        .any(
                                            Date
                                        ),
                            },
                        },
                    }
                );

                expect(
                    prisma.user.update
                ).toHaveBeenCalledTimes(
                    1
                );

                const updateCall =
                    prisma.user.update
                        .mock.calls[0][0];

                expect(
                    updateCall.where
                ).toEqual({
                    id: 1,
                });

                expect(
                    updateCall
                        .data
                        .password
                ).not.toBe(
                    "YeniGucluSifre123"
                );

                expect(
                    updateCall
                        .data
                        .tokenVersion
                ).toEqual({
                    increment: 1,
                });

                /*
                 * Şifre değişiminden sonra kullanıcıya
                 * ait kalan reset tokenları temizlenir.
                 */
                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenNthCalledWith(
                    2,
                    {
                        where: {
                            userId: 1,
                        },
                    }
                );
            }
        );
    }
);