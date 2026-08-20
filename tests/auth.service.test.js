const crypto = require("crypto");
const bcrypt = require("bcrypt");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock(
    "../src/config/prisma",
    () => ({
        user: {
            findUnique:
                jest.fn(),

            update:
                jest.fn(),
        },

        passwordResetToken: {
            findUnique:
                jest.fn(),

            create:
                jest.fn(),

            delete:
                jest.fn(),

            deleteMany:
                jest.fn(),
        },

        $transaction:
            jest.fn(),
    })
);


// Gerçek e-posta gönderimini engeller
jest.mock(
    "../src/services/email.service",
    () => ({
        sendPasswordResetEmail:
            jest.fn(),
    })
);


const prisma = require(
    "../src/config/prisma"
);

const emailService = require(
    "../src/services/email.service"
);

const authService = require(
    "../src/services/auth.service"
);


describe(
    "Auth Service - Password Reset",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();

            /*
             * Prisma'nın hem array transaction
             * hem interactive transaction
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
            "forgotPassword - kullanıcı yoksa bilgi sızdırmadan işlemi bitirmeli",
            async () => {
                prisma.user
                    .findUnique
                    .mockResolvedValue(
                        null
                    );


                const result =
                    await authService
                        .forgotPassword({
                            email:
                                "olmayan@example.com",
                        });


                expect(
                    result
                ).toBeNull();


                expect(
                    prisma.user
                        .findUnique
                ).toHaveBeenCalledWith({
                    where: {
                        email:
                            "olmayan@example.com",
                    },

                    select: {
                        id: true,
                        email: true,
                    },
                });


                expect(
                    prisma
                        .passwordResetToken
                        .create
                ).not
                    .toHaveBeenCalled();


                expect(
                    emailService
                        .sendPasswordResetEmail
                ).not
                    .toHaveBeenCalled();
            }
        );


        test(
            "forgotPassword - tokenı hashleyerek DB'ye kaydetmeli ve gerçek tokenı e-posta servisine göndermeli",
            async () => {
                prisma.user
                    .findUnique
                    .mockResolvedValue({
                        id: 1,
                        email:
                            "ali@example.com",
                    });


                prisma
                    .passwordResetToken
                    .deleteMany
                    .mockResolvedValue({
                        count: 1,
                    });


                prisma
                    .passwordResetToken
                    .create
                    .mockResolvedValue({
                        id: 10,
                    });


                emailService
                    .sendPasswordResetEmail
                    .mockResolvedValue();


                const result =
                    await authService
                        .forgotPassword({
                            email:
                                "  ALI@EXAMPLE.COM  ",
                        });


                expect(
                    result
                ).toBeNull();


                expect(
                    prisma.user
                        .findUnique
                ).toHaveBeenCalledWith({
                    where: {
                        email:
                            "ali@example.com",
                    },

                    select: {
                        id: true,
                        email: true,
                    },
                });


                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenCalledWith({
                    where: {
                        userId: 1,
                    },
                });


                expect(
                    prisma
                        .passwordResetToken
                        .create
                ).toHaveBeenCalledTimes(
                    1
                );


                const createCall =
                    prisma
                        .passwordResetToken
                        .create
                        .mock.calls[0][0];


                expect(
                    createCall
                        .data
                        .userId
                ).toBe(1);


                expect(
                    typeof createCall
                        .data
                        .tokenHash
                ).toBe(
                    "string"
                );


                expect(
                    createCall
                        .data
                        .tokenHash
                ).toHaveLength(
                    64
                );


                expect(
                    createCall
                        .data
                        .expiresAt
                ).toBeInstanceOf(
                    Date
                );


                expect(
                    emailService
                        .sendPasswordResetEmail
                ).toHaveBeenCalledTimes(
                    1
                );


                const [
                    email,
                    realToken,
                ] =
                    emailService
                        .sendPasswordResetEmail
                        .mock.calls[0];


                expect(
                    email
                ).toBe(
                    "ali@example.com"
                );


                expect(
                    typeof realToken
                ).toBe(
                    "string"
                );


                // randomBytes(32) hex formatında 64 karakter üretir
                expect(
                    realToken
                ).toMatch(
                    /^[a-f0-9]{64}$/
                );


                // E-postaya giden gerçek tokenın hash'i hesaplanır
                const expectedHash =
                    crypto
                        .createHash(
                            "sha256"
                        )
                        .update(
                            realToken
                        )
                        .digest(
                            "hex"
                        );


                // DB'de gerçek token değil hash tutulmalıdır
                expect(
                    createCall
                        .data
                        .tokenHash
                ).toBe(
                    expectedHash
                );


                expect(
                    createCall
                        .data
                        .tokenHash
                ).not.toBe(
                    realToken
                );


                expect(
                    prisma
                        .$transaction
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );


        test(
            "forgotPassword - e-posta gönderilemezse oluşturulan tokenı temizlemeli",
            async () => {
                prisma.user
                    .findUnique
                    .mockResolvedValue({
                        id: 1,
                        email:
                            "ali@example.com",
                    });


                prisma
                    .passwordResetToken
                    .deleteMany
                    .mockResolvedValue({
                        count: 1,
                    });


                prisma
                    .passwordResetToken
                    .create
                    .mockResolvedValue({
                        id: 10,
                    });


                emailService
                    .sendPasswordResetEmail
                    .mockRejectedValue(
                        new Error(
                            "SMTP bağlantı hatası"
                        )
                    );


                // Beklenen servis hatasının test çıktısını kirletmesini engeller
                const consoleErrorSpy =
                    jest
                        .spyOn(
                            console,
                            "error"
                        )
                        .mockImplementation(
                            () => {}
                        );


                const result =
                    await authService
                        .forgotPassword({
                            email:
                                "ali@example.com",
                        });


                expect(
                    result
                ).toBeNull();


                expect(
                    emailService
                        .sendPasswordResetEmail
                ).toHaveBeenCalledTimes(
                    1
                );


                const createCall =
                    prisma
                        .passwordResetToken
                        .create
                        .mock.calls[0][0];


                const tokenHash =
                    createCall
                        .data
                        .tokenHash;


                // İlk deleteMany eski tokenları temizler
                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenNthCalledWith(
                    1,
                    {
                        where: {
                            userId:
                                1,
                        },
                    }
                );


                // Mail başarısız olursa yeni oluşturulan token da temizlenir
                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenNthCalledWith(
                    2,
                    {
                        where: {
                            userId:
                                1,

                            tokenHash,
                        },
                    }
                );


                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenCalledTimes(
                    2
                );


                // SMTP hatası kullanıcıya fırlatılmaz
                expect(
                    result
                ).toBeNull();


                consoleErrorSpy
                    .mockRestore();
            }
        );


        test(
            "resetPassword - geçerli token ile şifreyi atomik tüketmeli ve şifreyi güncellemeli",
            async () => {
                const resetToken =
                    "a".repeat(
                        64
                    );


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
                 * İlk deleteMany token claim işlemidir.
                 * İkinci deleteMany diğer reset tokenları temizler.
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


                prisma.user
                    .update
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
                    prisma
                        .passwordResetToken
                        .findUnique
                ).toHaveBeenCalledWith({
                    where: {
                        tokenHash,
                    },
                });


                expect(
                    prisma
                        .$transaction
                ).toHaveBeenCalledTimes(
                    1
                );


                /*
                 * Token önce atomik olarak claim edilmelidir.
                 */
                const consumeCall =
                    prisma
                        .passwordResetToken
                        .deleteMany
                        .mock.calls[0][0];


                expect(
                    consumeCall
                        .where
                        .id
                ).toBe(
                    10
                );


                expect(
                    consumeCall
                        .where
                        .tokenHash
                ).toBe(
                    tokenHash
                );


                expect(
                    consumeCall
                        .where
                        .expiresAt
                        .gt
                ).toBeInstanceOf(
                    Date
                );


                expect(
                    prisma.user
                        .update
                ).toHaveBeenCalledTimes(
                    1
                );


                const updateCall =
                    prisma.user
                        .update
                        .mock.calls[0][0];


                expect(
                    updateCall.where
                ).toEqual({
                    id: 1,
                });


                // Yeni şifre DB'ye düz metin olarak gitmemelidir
                expect(
                    updateCall
                        .data
                        .password
                ).not.toBe(
                    "YeniGucluSifre123"
                );


                // Oluşturulan bcrypt hash gerçekten yeni şifreye ait olmalı
                expect(
                    await bcrypt.compare(
                        "YeniGucluSifre123",
                        updateCall
                            .data
                            .password
                    )
                ).toBe(
                    true
                );


                expect(
                    updateCall
                        .data
                        .tokenVersion
                ).toEqual({
                    increment: 1,
                });


                // Token claim sonrası diğer reset tokenları temizlenir
                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenNthCalledWith(
                    2,
                    {
                        where: {
                            userId:
                                1,
                        },
                    }
                );


                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenCalledTimes(
                    2
                );
            }
        );


        test(
            "resetPassword - token başka istek tarafından tüketilmişse şifreyi güncellememeli",
            async () => {
                const resetToken =
                    "d".repeat(
                        64
                    );


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
                        id: 30,
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
                 * count = 0 olması token'ın başka bir
                 * eşzamanlı istek tarafından tüketildiğini
                 * simüle eder.
                 */
                prisma
                    .passwordResetToken
                    .deleteMany
                    .mockResolvedValueOnce({
                        count: 0,
                    });


                await expect(
                    authService
                        .resetPassword({
                            token:
                                resetToken,

                            password:
                                "YeniGucluSifre123",
                        })
                ).rejects
                    .toMatchObject({
                        statusCode:
                            400,

                        message:
                            "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
                    });


                expect(
                    prisma
                        .$transaction
                ).toHaveBeenCalledTimes(
                    1
                );


                expect(
                    prisma.user
                        .update
                ).not
                    .toHaveBeenCalled();


                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenCalledTimes(
                    1
                );
            }
        );


        test(
            "resetPassword - süresi dolmuş tokenı güvenli şekilde silmeli ve 400 hata vermeli",
            async () => {
                const resetToken =
                    "b".repeat(
                        64
                    );


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
                        id: 20,
                        userId: 1,
                        tokenHash,

                        expiresAt:
                            new Date(
                                Date.now() -
                                    1000
                            ),
                    });


                prisma
                    .passwordResetToken
                    .deleteMany
                    .mockResolvedValue({
                        count: 1,
                    });


                await expect(
                    authService
                        .resetPassword({
                            token:
                                resetToken,

                            password:
                                "YeniGucluSifre123",
                        })
                ).rejects
                    .toMatchObject({
                        statusCode:
                            400,

                        message:
                            "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
                    });


                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).toHaveBeenCalledWith({
                    where: {
                        id: 20,
                        tokenHash,
                    },
                });


                expect(
                    prisma.user
                        .update
                ).not
                    .toHaveBeenCalled();


                expect(
                    prisma
                        .$transaction
                ).not
                    .toHaveBeenCalled();
            }
        );


        test(
            "resetPassword - DB'de bulunmayan token için 400 hata vermeli",
            async () => {
                const resetToken =
                    "c".repeat(
                        64
                    );


                prisma
                    .passwordResetToken
                    .findUnique
                    .mockResolvedValue(
                        null
                    );


                await expect(
                    authService
                        .resetPassword({
                            token:
                                resetToken,

                            password:
                                "YeniGucluSifre123",
                        })
                ).rejects
                    .toMatchObject({
                        statusCode:
                            400,

                        message:
                            "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
                    });


                expect(
                    prisma.user
                        .update
                ).not
                    .toHaveBeenCalled();


                expect(
                    prisma
                        .passwordResetToken
                        .deleteMany
                ).not
                    .toHaveBeenCalled();


                expect(
                    prisma
                        .$transaction
                ).not
                    .toHaveBeenCalled();
            }
        );
    }
);