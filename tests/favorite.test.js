const request = require("supertest");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
    },

    favorite: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
}));


const prisma = require(
    "../src/config/prisma"
);

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


describe("Favorite API", () => {
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
        "POST /favorites - filmi favorilere başarıyla eklemeli",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue(
                null
            );

            const createdFavorite = {
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            };

            prisma.favorite.create.mockResolvedValue(
                createdFavorite
            );

            const response = await request(app)
                .post("/favorites")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                });

            expect(
                response.statusCode
            ).toBe(201);

            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Film favorilere eklendi.",
                data:
                    createdFavorite,
            });

            expect(
                prisma.favorite.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId:
                            157336,
                    },
                },
            });

            expect(
                prisma.favorite.create
            ).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    tmdbMovieId:
                        157336,
                },
            });
        }
    );


    test(
        "POST /favorites - film zaten favorilerdeyse 400 dönmeli",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId:
                    157336,
            });

            const response =
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            157336,
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body
            ).toEqual({
                success: false,
                status: "fail",
                message:
                    "Film zaten favorilere eklenmiş.",
            });

            expect(
                prisma.favorite.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites - varsayılan pagination ile favorileri getirmeli",
        async () => {
            const favorites = [
                {
                    id: 2,
                    userId: 1,
                    tmdbMovieId:
                        27205,
                },
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId:
                        157336,
                },
            ];

            prisma.favorite.findMany.mockResolvedValue(
                favorites
            );

            prisma.favorite.count.mockResolvedValue(
                2
            );

            const response =
                await request(app)
                    .get("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Favoriler getirildi.",
                data: {
                    items:
                        favorites,

                    pagination: {
                        page: 1,
                        limit: 20,
                        totalItems:
                            2,
                        totalPages:
                            1,
                        hasNextPage:
                            false,
                        hasPreviousPage:
                            false,
                    },
                },
            });

            expect(
                prisma.favorite.findMany
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },

                orderBy: {
                    createdAt:
                        "desc",
                },

                skip: 0,
                take: 20,
            });

            expect(
                prisma.favorite.count
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },
            });
        }
    );


    test(
        "GET /favorites?page=2&limit=1 - doğru sayfayı istemeli",
        async () => {
            const favorites = [
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId:
                        157336,
                },
            ];

            prisma.favorite.findMany.mockResolvedValue(
                favorites
            );

            prisma.favorite.count.mockResolvedValue(
                2
            );

            const response =
                await request(app)
                    .get(
                        "/favorites?page=2&limit=1"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body.data
            ).toEqual({
                items:
                    favorites,

                pagination: {
                    page: 2,
                    limit: 1,
                    totalItems:
                        2,
                    totalPages:
                        2,
                    hasNextPage:
                        false,
                    hasPreviousPage:
                        true,
                },
            });

            expect(
                prisma.favorite.findMany
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },

                orderBy: {
                    createdAt:
                        "desc",
                },

                skip: 1,
                take: 1,
            });
        }
    );


    /*
     * Favorite status testleri
     */


    test(
        "GET /favorites/157336/status - film favorilerdeyse true dönmeli",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue({
                id: 1,
            });

            const response =
                await request(app)
                    .get(
                        "/favorites/157336/status"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Favori durumu getirildi.",
                data: {
                    isFavorite:
                        true,
                },
            });

            expect(
                prisma.favorite.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId:
                            157336,
                    },
                },

                select: {
                    id: true,
                },
            });
        }
    );


    test(
        "GET /favorites/157336/status - film favorilerde değilse false dönmeli",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue(
                null
            );

            const response =
                await request(app)
                    .get(
                        "/favorites/157336/status"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Favori durumu getirildi.",
                data: {
                    isFavorite:
                        false,
                },
            });

            expect(
                prisma.favorite.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId:
                            157336,
                    },
                },

                select: {
                    id: true,
                },
            });
        }
    );


    /*
     * Delete testleri
     */


    test(
        "DELETE /favorites/157336 - filmi favorilerden başarıyla kaldırmalı",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId:
                    157336,
            });

            prisma.favorite.delete.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId:
                    157336,
            });

            const response =
                await request(app)
                    .delete(
                        "/favorites/157336"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Film favorilerden kaldırıldı.",
                data: null,
            });

            expect(
                prisma.favorite.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId:
                            157336,
                    },
                },
            });

            expect(
                prisma.favorite.delete
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId:
                            157336,
                    },
                },
            });
        }
    );


    test(
        "DELETE /favorites/157336 - favori bulunamazsa 404 dönmeli",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue(
                null
            );

            const response =
                await request(app)
                    .delete(
                        "/favorites/157336"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(404);

            expect(
                response.body
            ).toEqual({
                success: false,
                status: "fail",
                message:
                    "Favori bulunamadı.",
            });

            expect(
                prisma.favorite.delete
            ).not.toHaveBeenCalled();
        }
    );


    /*
     * Validation ve authentication testleri
     */


    test(
        "POST /favorites - tmdbMovieId olmadan 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({});

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
                "tmdbMovieId alanı zorunludur."
            );

            expect(
                prisma.favorite.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /favorites - geçersiz tmdbMovieId için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            "abc",
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "tmdbMovieId geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.favorite.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /favorites - sıfır tmdbMovieId için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            0,
                    });

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "tmdbMovieId 0'dan büyük olmalıdır."
            );

            expect(
                prisma.favorite.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites/abc/status - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites/abc/status"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

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
                "TMDB film ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.favorite.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites/0/status - sıfır TMDB ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites/0/status"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "TMDB film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.favorite.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /favorites/abc - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .delete(
                        "/favorites/abc"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

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
                "TMDB film ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.favorite.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /favorites/0 - sıfır TMDB ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .delete(
                        "/favorites/0"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "TMDB film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.favorite.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites?page=0 - geçersiz page için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites?page=0"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "Sayfa numarası 0'dan büyük olmalıdır."
            );

            expect(
                prisma.favorite.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.favorite.count
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites?page=abc - metin page için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites?page=abc"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "Sayfa numarası geçerli bir tam sayı olmalıdır."
            );

            expect(
                prisma.favorite.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.favorite.count
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites?limit=101 - maksimum limit aşılırsa 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites?limit=101"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "Limit en fazla 100 olabilir."
            );

            expect(
                prisma.favorite.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.favorite.count
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites?limit=abc - metin limit için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites?limit=abc"
                    )
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    );

            expect(
                response.statusCode
            ).toBe(400);

            expect(
                response.body.errors
            ).toContain(
                "Limit geçerli bir tam sayı olmalıdır."
            );

            expect(
                prisma.favorite.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.favorite.count
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites/157336/status - token olmadan 401 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites/157336/status"
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

            expect(
                prisma.favorite.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites - token olmadan 401 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/favorites"
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

            expect(
                prisma.favorite.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.favorite.count
            ).not.toHaveBeenCalled();
        }
    );
});