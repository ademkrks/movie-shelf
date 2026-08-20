const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock(
    "../src/config/prisma",
    () => ({
        user: {
            findUnique:
                jest.fn(),
            create:
                jest.fn(),
        },
    })
);


const prisma = require(
    "../src/config/prisma"
);

const app = require(
    "../src/app"
);


describe("Auth API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    /*
     * Başarılı auth ve servis testleri
     */


    test(
        "POST /auth/register - kullanıcıyı başarıyla oluşturmalı",
        async () => {
            prisma.user.findUnique
                .mockResolvedValue(
                    null
                );

            const createdUser = {
                id: 1,
                name: "Ali",
                email:
                    "ali@example.com",
                createdAt:
                    new Date(
                        "2026-08-13T10:00:00.000Z"
                    ),
            };

            prisma.user.create
                .mockResolvedValue(
                    createdUser
                );

            const response =
                await request(app)
                    .post(
                        "/auth/register"
                    )
                    .send({
                        name:
                            "  Ali  ",
                        email:
                            "  ALI@EXAMPLE.COM  ",
                        password:
                            "GucluSifre123",
                    });

            expect(
                response.statusCode
            ).toBe(201);

            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Kullanıcı başarıyla oluşturuldu.",
                data: {
                    ...createdUser,
                    createdAt:
                        createdUser
                            .createdAt
                            .toISOString(),
                },
            });

            expect(
                prisma.user.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    email:
                        "ali@example.com",
                },
            });

            expect(
                prisma.user.create
            ).toHaveBeenCalledTimes(
                1
            );

            const createCall =
                prisma.user.create
                    .mock.calls[0][0];

            expect(
                createCall.data.name
            ).toBe(
                "Ali"
            );

            expect(
                createCall.data.email
            ).toBe(
                "ali@example.com"
            );

            expect(
                createCall.data.password
            ).not.toBe(
                "GucluSifre123"
            );

            expect(
                await bcrypt.compare(
                    "GucluSifre123",
                    createCall
                        .data.password
                )
            ).toBe(true);

            expect(
                createCall.select
            ).toEqual({
                id: true,
                name: true,
                email: true,
                createdAt: true,
            });
        }
    );


    test(
        "POST /auth/register - kayıtlı email için 400 dönmeli",
        async () => {
            prisma.user.findUnique
                .mockResolvedValue({
                    id: 1,
                    email:
                        "ali@example.com",
                });

            const response =
                await request(app)
                    .post(
                        "/auth/register"
                    )
                    .send({
                        name:
                            "Ali",
                        email:
                            "ALI@EXAMPLE.COM",
                        password:
                            "GucluSifre123",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Bu e-posta adresi zaten kayıtlı.",
            });

            expect(
                prisma.user.create
            ).not
                .toHaveBeenCalled();
        }
    );


    test(
        "POST /auth/login - doğru bilgilerle giriş yapmalı",
        async () => {
            const hashedPassword =
                await bcrypt.hash(
                    "GucluSifre123",
                    10
                );

            prisma.user.findUnique
                .mockResolvedValue({
                    id: 1,
                    name:
                        "Ali",
                    email:
                        "ali@example.com",
                    password:
                        hashedPassword,
                    tokenVersion:
                        0,
                    createdAt:
                        new Date(
                            "2026-08-13T10:00:00.000Z"
                        ),
                });

            const response =
                await request(app)
                    .post(
                        "/auth/login"
                    )
                    .send({
                        email:
                            "  ALI@EXAMPLE.COM ",
                        password:
                            "GucluSifre123",
                    });

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body.success
            ).toBe(true);

            expect(
                response.body.message
            ).toBe(
                "Giriş başarılı."
            );

            expect(
                response.body
                    .data.user
            ).toEqual({
                id: 1,
                name: "Ali",
                email:
                    "ali@example.com",
                createdAt:
                    "2026-08-13T10:00:00.000Z",
            });

            expect(
                response.body
                    .data.user
                    .password
            ).toBeUndefined();

            expect(
                typeof response.body
                    .data.token
            ).toBe(
                "string"
            );

            const decodedToken =
                jwt.verify(
                    response.body
                        .data.token,
                    process.env
                        .JWT_SECRET,
                    {
                        algorithms: [
                            "HS256",
                        ],
                    }
                );

            expect(
                decodedToken.id
            ).toBe(1);

            const completeToken =
                jwt.decode(
                    response.body
                        .data.token,
                    {
                        complete:
                            true,
                    }
                );

            expect(
                completeToken
                    .header.alg
            ).toBe(
                "HS256"
            );

            expect(
                prisma.user.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    email:
                        "ali@example.com",
                },
            });
        }
    );


    test(
        "POST /auth/login - yanlış şifre için 401 dönmeli",
        async () => {
            const hashedPassword =
                await bcrypt.hash(
                    "DogruSifre123",
                    10
                );

            prisma.user.findUnique
                .mockResolvedValue({
                    id: 1,
                    name:
                        "Ali",
                    email:
                        "ali@example.com",
                    password:
                        hashedPassword,
                    tokenVersion:
                        0,
                    createdAt:
                        new Date(),
                });

            const response =
                await request(app)
                    .post(
                        "/auth/login"
                    )
                    .send({
                        email:
                            "ali@example.com",
                        password:
                            "YanlisSifre123",
                    });

            expect(
                response.statusCode
            ).toBe(401);

            expect(
                response.body
            ).toEqual({
                success: false,
                status: "fail",
                message:
                    "E-posta veya şifre hatalı.",
            });
        }
    );


    /*
     * Validation ve security testleri
     */


    test(
        "POST /auth/register - kısa şifre için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post(
                        "/auth/register"
                    )
                    .send({
                        name:
                            "Ali",
                        email:
                            "ali@example.com",
                        password:
                            "123",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz istek.",
            });

            expect(
                response.body.errors
            ).toContain(
                "Şifre en az 8 karakter olmalıdır."
            );

            expect(
                prisma.user.create
            ).not
                .toHaveBeenCalled();
        }
    );


    test(
        "POST /auth/register - bcrypt sınırını aşan şifre için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post(
                        "/auth/register"
                    )
                    .send({
                        name:
                            "Ali",
                        email:
                            "ali@example.com",
                        password:
                            "a".repeat(
                                73
                            ),
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz istek.",
            });

            expect(
                response.body.errors
            ).toContain(
                "Şifre UTF-8 olarak en fazla 72 byte olabilir."
            );

            expect(
                prisma.user.findUnique
            ).not
                .toHaveBeenCalled();

            expect(
                prisma.user.create
            ).not
                .toHaveBeenCalled();
        }
    );


    test(
        "POST /auth/login - geçersiz email için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post(
                        "/auth/login"
                    )
                    .send({
                        email:
                            "gecersiz-email",
                        password:
                            "12345678",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz istek.",
            });

            expect(
                prisma.user.findUnique
            ).not
                .toHaveBeenCalled();
        }
    );


    test(
        "POST /auth/forgot-password - geçersiz email için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post(
                        "/auth/forgot-password"
                    )
                    .send({
                        email:
                            "yanlis-email",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz istek.",
            });
        }
    );


    test(
        "POST /auth/reset-password - geçersiz token için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post(
                        "/auth/reset-password"
                    )
                    .send({
                        token:
                            "gecersiz-token",
                        password:
                            "YeniSifre123",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz istek.",
            });
        }
    );


    test(
        "GET /users/me - token olmadan 401 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/users/me"
                    );

            expect(
                response.statusCode
            ).toBe(401);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Yetkilendirme başarısız.",
            });
        }
    );


    test(
        "GET /users/me - geçersiz JWT ile 401 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/users/me"
                    )
                    .set(
                        "Authorization",
                        "Bearer bu-gecerli-bir-jwt-degil"
                    );

            expect(
                response.statusCode
            ).toBe(401);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz veya süresi dolmuş token.",
            });
        }
    );


    test(
        "GET /users/me - HS256 dışındaki JWT algoritmasını reddetmeli",
        async () => {
            const token =
                jwt.sign(
                    {
                        id: 1,
                        tokenVersion:
                            0,
                    },
                    process.env
                        .JWT_SECRET,
                    {
                        algorithm:
                            "HS384",
                        expiresIn:
                            "1h",
                    }
                );

            const response =
                await request(app)
                    .get(
                        "/users/me"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );

            expect(
                response.statusCode
            ).toBe(401);

            expect(
                response.body
            ).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Geçersiz veya süresi dolmuş token.",
            });

            expect(
                prisma.user.findUnique
            ).not
                .toHaveBeenCalled();
        }
    );
});