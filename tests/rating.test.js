const request = require("supertest");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
    },

    rating: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));


const prisma = require("../src/config/prisma");
const app = require("../src/app");


// Test kullanıcısı için geçerli JWT oluşturur
const createAuthToken = () => {
    return jwt.sign(
        {
            id: 1,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};


describe("Rating API", () => {
    let authToken;


    beforeEach(() => {
        jest.clearAllMocks();

        // Auth middleware'in bulacağı sahte kullanıcı
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            name: "Test User",
            email: "test@example.com",
            createdAt: new Date(),
        });

        authToken = createAuthToken();
    });


    /*
     * Başarılı endpoint ve servis testleri
     */


    test(
        "POST /ratings - filme başarıyla puan eklemeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue(
                null
            );

            const createdRating = {
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                rating: 9,
            };

            prisma.rating.create.mockResolvedValue(
                createdRating
            );

            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    rating: 9,
                });

            expect(response.statusCode).toBe(201);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film başarıyla puanlandı.",
                data: createdRating,
            });

            expect(
                prisma.rating.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
                    },
                },
            });

            expect(
                prisma.rating.create
            ).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    tmdbMovieId: 157336,
                    rating: 9,
                },
            });
        }
    );


    test(
        "POST /ratings - aynı filme ikinci kez puan verilirse 400 dönmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                rating: 8,
            });

            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    rating: 9,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Bu filme zaten puan verdiniz.",
            });

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /ratings/movie/157336 - varsayılan pagination ile puanları ve ortalamayı getirmeli",
        async () => {
            const ratings = [
                {
                    id: 2,
                    userId: 2,
                    tmdbMovieId: 157336,
                    rating: 9,
                    user: {
                        id: 2,
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId: 157336,
                    rating: 8,
                    user: {
                        id: 1,
                    },
                },
            ];

            prisma.rating.findMany.mockResolvedValue(
                ratings
            );

            prisma.rating.aggregate.mockResolvedValue({
                _avg: {
                    rating: 8.666,
                },
                _count: {
                    rating: 2,
                },
            });

            const response = await request(app)
                .get(
                    "/ratings/movie/157336"
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film puanları getirildi.",
                data: {
                    items: ratings,
                    averageRatings: 8.67,
                    totalRatings: 2,
                    pagination: {
                        page: 1,
                        limit: 20,
                        totalItems: 2,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    },
                },
            });

            expect(
                prisma.rating.findMany
            ).toHaveBeenCalledWith({
                where: {
                    tmdbMovieId: 157336,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: 0,
                take: 20,
            });

            expect(
                prisma.rating.aggregate
            ).toHaveBeenCalledWith({
                where: {
                    tmdbMovieId: 157336,
                },
                _avg: {
                    rating: true,
                },
                _count: {
                    rating: true,
                },
            });
        }
    );


    test(
        "GET /ratings/movie/157336?page=2&limit=1 - sayfayı getirirken genel ortalamayı korumalı",
        async () => {
            const ratings = [
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId: 157336,
                    rating: 8,
                    user: {
                        id: 1,
                    },
                },
            ];

            prisma.rating.findMany.mockResolvedValue(
                ratings
            );

            prisma.rating.aggregate.mockResolvedValue({
                _avg: {
                    rating: 8.5,
                },
                _count: {
                    rating: 2,
                },
            });

            const response = await request(app)
                .get(
                    "/ratings/movie/157336?page=2&limit=1"
                );

            expect(response.statusCode).toBe(200);

            expect(response.body.data).toEqual({
                items: ratings,
                averageRatings: 8.5,
                totalRatings: 2,
                pagination: {
                    page: 2,
                    limit: 1,
                    totalItems: 2,
                    totalPages: 2,
                    hasNextPage: false,
                    hasPreviousPage: true,
                },
            });

            expect(
                prisma.rating.findMany
            ).toHaveBeenCalledWith({
                where: {
                    tmdbMovieId: 157336,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: 1,
                take: 1,
            });
        }
    );


    test(
        "GET /ratings/movie/157336/me - kullanıcı puan verdiyse kendi puanını getirmeli",
        async () => {
            const myRating = {
                id: 7,
                tmdbMovieId: 157336,
                rating: 9,
            };

            prisma.rating.findUnique.mockResolvedValue(
                myRating
            );

            const response = await request(app)
                .get(
                    "/ratings/movie/157336/me"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Kullanıcının film puanı getirildi.",
                data: myRating,
            });

            expect(
                prisma.rating.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
                    },
                },
                select: {
                    id: true,
                    tmdbMovieId: true,
                    rating: true,
                },
            });
        }
    );


    test(
        "GET /ratings/movie/157336/me - kullanıcı puan vermediyse null dönmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .get(
                    "/ratings/movie/157336/me"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Kullanıcının film puanı getirildi.",
                data: null,
            });

            expect(
                prisma.rating.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
                    },
                },
                select: {
                    id: true,
                    tmdbMovieId: true,
                    rating: true,
                },
            });
        }
    );


    test(
        "GET /ratings/movie/abc/me - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/ratings/movie/abc/me"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "TMDB film ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.rating.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /ratings/movie/157336/me - token olmadan 401 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/ratings/movie/157336/me"
                );

            expect(response.statusCode).toBe(401);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Yetkilendirme başarısız.",
            });

            expect(
                prisma.rating.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /ratings/movie/157336?page=0 - geçersiz page için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/ratings/movie/157336?page=0"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Sayfa numarası 0'dan büyük olmalıdır."
            );

            expect(
                prisma.rating.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.rating.aggregate
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /ratings/movie/157336?limit=101 - maksimum limit aşılırsa 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/ratings/movie/157336?limit=101"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Limit en fazla 100 olabilir."
            );

            expect(
                prisma.rating.findMany
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /ratings/1 - kullanıcı kendi puanını güncelleyebilmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                rating: 7,
            });

            const updatedRating = {
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                rating: 9,
            };

            prisma.rating.update.mockResolvedValue(
                updatedRating
            );

            const response = await request(app)
                .put("/ratings/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    rating: 9,
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film puanı güncellendi.",
                data: updatedRating,
            });

            expect(
                prisma.rating.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });

            expect(
                prisma.rating.update
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                data: {
                    rating: 9,
                },
            });
        }
    );


    test(
        "PUT /ratings/999 - puan bulunamazsa 404 dönmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .put("/ratings/999")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    rating: 8,
                });

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message: "Puan bulunamadı.",
            });

            expect(
                prisma.rating.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /ratings/1 - başka kullanıcının puanı için 403 dönmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue({
                id: 1,
                userId: 999,
                tmdbMovieId: 157336,
                rating: 7,
            });

            const response = await request(app)
                .put("/ratings/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    rating: 8,
                });

            expect(response.statusCode).toBe(403);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Bu puanı güncelleme yetkiniz yok.",
            });

            expect(
                prisma.rating.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /ratings/1 - kullanıcı kendi puanını silebilmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                rating: 9,
            });

            prisma.rating.delete.mockResolvedValue({
                id: 1,
            });

            const response = await request(app)
                .delete("/ratings/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film puanı silindi.",
                data: null,
            });

            expect(
                prisma.rating.delete
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
        }
    );


    test(
        "DELETE /ratings/999 - puan bulunamazsa 404 dönmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .delete("/ratings/999")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message: "Puan bulunamadı.",
            });

            expect(
                prisma.rating.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /ratings/1 - başka kullanıcının puanı için 403 dönmeli",
        async () => {
            prisma.rating.findUnique.mockResolvedValue({
                id: 1,
                userId: 999,
                tmdbMovieId: 157336,
                rating: 9,
            });

            const response = await request(app)
                .delete("/ratings/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(403);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Bu puanı silme yetkiniz yok.",
            });

            expect(
                prisma.rating.delete
            ).not.toHaveBeenCalled();
        }
    );


    /*
     * Validation testleri
     */


    test(
        "POST /ratings - tmdbMovieId olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    rating: 8,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "tmdbMovieId alanı zorunludur."
            );

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /ratings - geçersiz tmdbMovieId için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: "abc",
                    rating: 8,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "tmdbMovieId geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /ratings - rating olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "rating alanı zorunludur."
            );

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /ratings - 10 üzeri rating için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    rating: 11,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "rating 1 ile 10 arasında olmalıdır."
            );

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /ratings - 0 rating için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    rating: 0,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "rating 1 ile 10 arasında olmalıdır."
            );

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /ratings - ondalıklı rating için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/ratings")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    rating: 8.5,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "rating tam sayı olmalıdır."
            );

            expect(
                prisma.rating.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /ratings/movie/abc - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/ratings/movie/abc"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "TMDB film ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.rating.findMany
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /ratings/movie/0 - sıfır TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/ratings/movie/0"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "TMDB film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.rating.findMany
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /ratings/abc - geçersiz rating ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/ratings/abc")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    rating: 8,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Puan ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.rating.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /ratings/1 - geçersiz rating için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/ratings/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    rating: 15,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "rating 1 ile 10 arasında olmalıdır."
            );

            expect(
                prisma.rating.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /ratings/abc - geçersiz rating ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .delete("/ratings/abc")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Puan ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.rating.delete
            ).not.toHaveBeenCalled();
        }
    );
});