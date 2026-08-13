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

            // Transaction içindeki mock işlemleri çalıştırır
            prisma.$transaction
                .mockImplementation(
                    async (operations) => {
                        return Promise.all(
                            operations
                        );
                    }
                );
        });


        test(
            "auth - güncel tokenVersion değerine sahip JWT'yi kabul etmeli",
            async () => {
                const token = jwt.sign(
                    {
                        id: 1,
                        tokenVersion: 2,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "1h",
                    }
                );

                prisma.user.findUnique
                    .mockResolvedValue({
                        id: 1,
                        name: "Ali",
                        email:
                            "ali@example.com",
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
                const next = jest.fn();

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
                        tokenVersion: true,
                        createdAt: true,
                    },
                });

                expect(next)
                    .toHaveBeenCalledTimes(
                        1
                    );

                expect(next)
                    .toHaveBeenCalledWith();

                // tokenVersion request kullanıcısına taşınmaz
                expect(req.user).toEqual({
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
            }
        );


        test(
            "auth - eski tokenVersion değerine sahip JWT'yi 401 ile reddetmeli",
            async () => {
                /*
                 * Kullanıcı password reset öncesinde
                 * tokenVersion 0 ile JWT almış olsun.
                 */
                const oldToken = jwt.sign(
                    {
                        id: 1,
                        tokenVersion: 0,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "1h",
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
                const next = jest.fn();

                await auth(
                    req,
                    res,
                    next
                );

                expect(next)
                    .toHaveBeenCalledTimes(
                        1
                    );

                const error =
                    next.mock.calls[0][0];

                expect(error)
                    .toMatchObject({
                        statusCode: 401,
                        message:
                            "Geçersiz veya süresi dolmuş token.",
                    });

                expect(
                    req.user
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
                        .digest("hex");

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

                prisma.user.update
                    .mockResolvedValue({
                        id: 1,
                    });

                prisma
                    .passwordResetToken
                    .deleteMany
                    .mockResolvedValue({
                        count: 1,
                    });

                const result =
                    await authService
                        .resetPassword({
                            token:
                                resetToken,
                            password:
                                "YeniGucluSifre123",
                        });

                expect(result)
                    .toBeNull();

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
                    updateCall.data.password
                ).not.toBe(
                    "YeniGucluSifre123"
                );

                expect(
                    updateCall.data
                        .tokenVersion
                ).toEqual({
                    increment: 1,
                });

                expect(
                    prisma.$transaction
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );
    }
);