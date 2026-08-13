const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },

    passwordResetToken: {
        deleteMany: jest.fn(),
    },

    $transaction: jest.fn(),
}));


const prisma = require("../src/config/prisma");
const app = require("../src/app");


// Test kullanıcısı için geçerli JWT oluşturur
const createAuthToken = () => {
    return jwt.sign(
        {
            id: 1,
            tokenVersion: 0,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};


// Auth middleware'in kullanacağı sahte kullanıcı
const createMockAuthUser = () => {
    return {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "USER",
        tokenVersion: 0,
        createdAt: new Date(
            "2026-08-13T10:00:00.000Z"
        ),
    };
};


describe("User API", () => {
    let authToken;


    beforeEach(() => {
        jest.clearAllMocks();

        // Auth middleware'in bulacağı sahte kullanıcı
        prisma.user.findUnique.mockResolvedValue(
            createMockAuthUser()
        );

        prisma.$transaction.mockResolvedValue([]);

        authToken = createAuthToken();
    });


    /*
     * Profil validation testleri
     */


    test(
        "PUT /users/me - token olmadan 401 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .send({
                    name: "Yeni İsim",
                });

            expect(response.statusCode).toBe(401);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Yetkilendirme başarısız.",
            });
        }
    );


    test(
        "PUT /users/me - boş body için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Güncellenecek en az bir alan gönderilmelidir."
            );
        }
    );


    test(
        "PUT /users/me - name metin değilse 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    name: 123,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Ad alanı metin olmalıdır."
            );
        }
    );


    test(
        "PUT /users/me - boş name için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    name: "   ",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Ad alanı boş bırakılamaz."
            );
        }
    );


    test(
        "PUT /users/me - 100 karakter üzeri name için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    name: "a".repeat(101),
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Ad alanı en fazla 100 karakter olabilir."
            );
        }
    );


    test(
        "PUT /users/me - email metin değilse 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: 123,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "E-posta alanı metin olmalıdır."
            );
        }
    );


    test(
        "PUT /users/me - boş email için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: "   ",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "E-posta alanı boş bırakılamaz."
            );
        }
    );


    test(
        "PUT /users/me - geçersiz email için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: "gecersiz-email",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Geçerli bir e-posta adresi giriniz."
            );
        }
    );


    test(
        "PUT /users/me - 255 karakter üzeri email için 400 dönmeli",
        async () => {
            const longEmail =
                `${"a".repeat(245)}@example.com`;

            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: longEmail,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "E-posta alanı en fazla 255 karakter olabilir."
            );
        }
    );


    /*
     * Şifre değiştirme testleri
     */


    test(
        "PUT /users/change-password - şifreyi başarıyla değiştirmeli",
        async () => {
            const hashedCurrentPassword =
                await bcrypt.hash(
                    "MevcutSifre123",
                    10
                );

            /*
             * İlk findUnique auth middleware içindir.
             * İkinci findUnique şifre kontrolü içindir.
             */
            prisma.user.findUnique
                .mockResolvedValueOnce(
                    createMockAuthUser()
                )
                .mockResolvedValueOnce({
                    id: 1,
                    password:
                        hashedCurrentPassword,
                });

            prisma.user.update.mockResolvedValue({
                id: 1,
            });

            prisma.passwordResetToken.deleteMany
                .mockResolvedValue({
                    count: 1,
                });

            const response = await request(app)
                .put(
                    "/users/change-password"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    currentPassword:
                        "MevcutSifre123",
                    newPassword:
                        "YeniGucluSifre456",
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Şifre başarıyla değiştirildi. Lütfen tekrar giriş yapın.",
                data: null,
            });

            expect(
                prisma.user.update
            ).toHaveBeenCalledTimes(1);

            const updateCall =
                prisma.user.update.mock.calls[0][0];

            expect(updateCall.where).toEqual({
                id: 1,
            });

            // Yeni şifre düz metin olarak DB'ye gitmemeli
            expect(
                updateCall.data.password
            ).not.toBe(
                "YeniGucluSifre456"
            );

            // Oluşturulan hash yeni şifreye ait olmalı
            expect(
                await bcrypt.compare(
                    "YeniGucluSifre456",
                    updateCall.data.password
                )
            ).toBe(true);

            // Eski JWT'leri geçersiz kılmalı
            expect(
                updateCall.data.tokenVersion
            ).toEqual({
                increment: 1,
            });

            // Açık password reset tokenlarını silmeli
            expect(
                prisma.passwordResetToken
                    .deleteMany
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },
            });

            expect(
                prisma.$transaction
            ).toHaveBeenCalledTimes(1);
        }
    );


    test(
        "PUT /users/change-password - yanlış mevcut şifre için 401 dönmeli",
        async () => {
            const hashedCurrentPassword =
                await bcrypt.hash(
                    "DogruSifre123",
                    10
                );

            prisma.user.findUnique
                .mockResolvedValueOnce(
                    createMockAuthUser()
                )
                .mockResolvedValueOnce({
                    id: 1,
                    password:
                        hashedCurrentPassword,
                });

            const response = await request(app)
                .put(
                    "/users/change-password"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    currentPassword:
                        "YanlisSifre123",
                    newPassword:
                        "YeniGucluSifre456",
                });

            expect(response.statusCode).toBe(401);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Mevcut şifre hatalı.",
            });

            expect(
                prisma.user.update
            ).not.toHaveBeenCalled();

            expect(
                prisma.passwordResetToken
                    .deleteMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.$transaction
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /users/change-password - yeni şifre mevcut şifreyle aynıysa 400 dönmeli",
        async () => {
            const hashedCurrentPassword =
                await bcrypt.hash(
                    "MevcutSifre123",
                    10
                );

            prisma.user.findUnique
                .mockResolvedValueOnce(
                    createMockAuthUser()
                )
                .mockResolvedValueOnce({
                    id: 1,
                    password:
                        hashedCurrentPassword,
                });

            const response = await request(app)
                .put(
                    "/users/change-password"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    currentPassword:
                        "MevcutSifre123",
                    newPassword:
                        "MevcutSifre123",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Yeni şifre mevcut şifre ile aynı olamaz.",
            });

            expect(
                prisma.user.update
            ).not.toHaveBeenCalled();

            expect(
                prisma.$transaction
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /users/change-password - kısa yeni şifre için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put(
                    "/users/change-password"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    currentPassword:
                        "MevcutSifre123",
                    newPassword: "123",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Yeni şifre en az 8 karakter olmalıdır."
            );

            expect(
                prisma.user.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /users/change-password - mevcut şifre olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .put(
                    "/users/change-password"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    newPassword:
                        "YeniGucluSifre456",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Mevcut şifre alanı zorunludur."
            );

            expect(
                prisma.user.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /users/change-password - token olmadan 401 dönmeli",
        async () => {
            const response = await request(app)
                .put(
                    "/users/change-password"
                )
                .send({
                    currentPassword:
                        "MevcutSifre123",
                    newPassword:
                        "YeniGucluSifre456",
                });

            expect(response.statusCode).toBe(401);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Yetkilendirme başarısız.",
            });

            expect(
                prisma.user.update
            ).not.toHaveBeenCalled();
        }
    );
});