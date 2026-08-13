const request = require("supertest");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
    },

    review: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
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


describe("Review API", () => {
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
        "POST /reviews - yorumu başarıyla eklemeli",
        async () => {
            const createdReview = {
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                content: "Harika bir film.",
            };

            prisma.review.create.mockResolvedValue(
                createdReview
            );

            const response = await request(app)
                .post("/reviews")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    content:
                        "   Harika bir film.   ",
                });

            expect(response.statusCode).toBe(201);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Yorum başarıyla eklendi.",
                data: createdReview,
            });

            expect(
                prisma.review.create
            ).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    tmdbMovieId: 157336,
                    content:
                        "Harika bir film.",
                },
            });
        }
    );


    test(
        "GET /reviews/movie/157336 - varsayılan pagination ile yorumları getirmeli",
        async () => {
            const reviews = [
                {
                    id: 2,
                    userId: 2,
                    tmdbMovieId: 157336,
                    content:
                        "Çok başarılı.",
                    user: {
                        id: 2,
                        name: "User 2",
                    },
                },
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId: 157336,
                    content:
                        "Harika bir film.",
                    user: {
                        id: 1,
                        name: "Test User",
                    },
                },
            ];

            prisma.review.findMany.mockResolvedValue(
                reviews
            );

            prisma.review.count.mockResolvedValue(
                2
            );

            const response = await request(app)
                .get(
                    "/reviews/movie/157336"
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film yorumları getirildi.",
                data: {
                    items: reviews,
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
                prisma.review.findMany
            ).toHaveBeenCalledWith({
                where: {
                    tmdbMovieId: 157336,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
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
                prisma.review.count
            ).toHaveBeenCalledWith({
                where: {
                    tmdbMovieId: 157336,
                },
            });
        }
    );


    test(
        "GET /reviews/movie/157336?page=2&limit=1 - doğru sayfayı getirmeli",
        async () => {
            const reviews = [
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId: 157336,
                    content:
                        "Harika bir film.",
                    user: {
                        id: 1,
                        name: "Test User",
                    },
                },
            ];

            prisma.review.findMany.mockResolvedValue(
                reviews
            );

            prisma.review.count.mockResolvedValue(
                2
            );

            const response = await request(app)
                .get(
                    "/reviews/movie/157336?page=2&limit=1"
                );

            expect(response.statusCode).toBe(200);

            expect(response.body.data).toEqual({
                items: reviews,
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
                prisma.review.findMany
            ).toHaveBeenCalledWith({
                where: {
                    tmdbMovieId: 157336,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
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
        "GET /reviews/movie/157336?page=0 - geçersiz page için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/reviews/movie/157336?page=0"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Sayfa numarası 0'dan büyük olmalıdır."
            );

            expect(
                prisma.review.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.review.count
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /reviews/movie/157336?limit=101 - maksimum limit aşılırsa 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/reviews/movie/157336?limit=101"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Limit en fazla 100 olabilir."
            );

            expect(
                prisma.review.findMany
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /reviews/1 - kullanıcı kendi yorumunu güncelleyebilmeli",
        async () => {
            prisma.review.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                content:
                    "Eski yorum.",
            });

            const updatedReview = {
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                content:
                    "Güncellenmiş yorum.",
            };

            prisma.review.update.mockResolvedValue(
                updatedReview
            );

            const response = await request(app)
                .put("/reviews/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content:
                        "   Güncellenmiş yorum.   ",
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Yorum güncellendi.",
                data: updatedReview,
            });

            expect(
                prisma.review.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });

            expect(
                prisma.review.update
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                data: {
                    content:
                        "Güncellenmiş yorum.",
                },
            });
        }
    );


    test(
        "PUT /reviews/999 - yorum bulunamazsa 404 dönmeli",
        async () => {
            prisma.review.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .put("/reviews/999")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content:
                        "Güncellenmiş yorum.",
                });

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message: "Yorum bulunamadı.",
            });

            expect(
                prisma.review.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /reviews/1 - başka kullanıcının yorumu için 403 dönmeli",
        async () => {
            prisma.review.findUnique.mockResolvedValue({
                id: 1,
                userId: 999,
                tmdbMovieId: 157336,
                content:
                    "Başka kullanıcının yorumu.",
            });

            const response = await request(app)
                .put("/reviews/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content:
                        "Değiştirmeye çalışıyorum.",
                });

            expect(response.statusCode).toBe(403);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Bu yorumu güncelleme yetkiniz yok.",
            });

            expect(
                prisma.review.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /reviews/1 - kullanıcı kendi yorumunu silebilmeli",
        async () => {
            prisma.review.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
                content:
                    "Silinecek yorum.",
            });

            prisma.review.delete.mockResolvedValue({
                id: 1,
            });

            const response = await request(app)
                .delete("/reviews/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Yorum silindi.",
                data: null,
            });

            expect(
                prisma.review.delete
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
        }
    );


    test(
        "DELETE /reviews/999 - yorum bulunamazsa 404 dönmeli",
        async () => {
            prisma.review.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .delete("/reviews/999")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message: "Yorum bulunamadı.",
            });

            expect(
                prisma.review.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /reviews/1 - başka kullanıcının yorumu için 403 dönmeli",
        async () => {
            prisma.review.findUnique.mockResolvedValue({
                id: 1,
                userId: 999,
                tmdbMovieId: 157336,
                content:
                    "Başka kullanıcının yorumu.",
            });

            const response = await request(app)
                .delete("/reviews/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(403);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Bu yorumu silme yetkiniz yok.",
            });

            expect(
                prisma.review.delete
            ).not.toHaveBeenCalled();
        }
    );


    /*
     * Validation testleri
     */


    test(
        "POST /reviews - tmdbMovieId olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/reviews")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content:
                        "Harika bir film.",
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
                prisma.review.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /reviews - geçersiz tmdbMovieId için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/reviews")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: "abc",
                    content:
                        "Harika bir film.",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "tmdbMovieId geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.review.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /reviews - boş content için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/reviews")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    content: "",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Yorum içeriği boş bırakılamaz."
            );

            expect(
                prisma.review.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /reviews - 1000 karakter üzeri content için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/reviews")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                    content:
                        "a".repeat(1001),
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Yorum içeriği en fazla 1000 karakter olabilir."
            );

            expect(
                prisma.review.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /reviews/movie/abc - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/reviews/movie/abc"
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
                prisma.review.findMany
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /reviews/movie/0 - sıfır TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get(
                    "/reviews/movie/0"
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "TMDB film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.review.findMany
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /reviews/abc - geçersiz yorum ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/reviews/abc")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content:
                        "Güncellenmiş yorum.",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Yorum ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.review.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /reviews/1 - boş content için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/reviews/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content: "   ",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Yorum içeriği boş bırakılamaz."
            );

            expect(
                prisma.review.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /reviews/1 - 1000 karakter üzeri content için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/reviews/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    content:
                        "a".repeat(1001),
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Yorum içeriği en fazla 1000 karakter olabilir."
            );

            expect(
                prisma.review.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /reviews/abc - geçersiz yorum ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .delete("/reviews/abc")
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
                "Yorum ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.review.delete
            ).not.toHaveBeenCalled();
        }
    );
});