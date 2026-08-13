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
        create: jest.fn(),
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

            expect(response.statusCode).toBe(201);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film favorilere eklendi.",
                data: createdFavorite,
            });

            expect(
                prisma.favorite.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
                    },
                },
            });

            expect(
                prisma.favorite.create
            ).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    tmdbMovieId: 157336,
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
                tmdbMovieId: 157336,
            });

            const response = await request(app)
                .post("/favorites")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 157336,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
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
        "GET /favorites - kullanıcının favorilerini başarıyla getirmeli",
        async () => {
            const favorites = [
                {
                    id: 2,
                    userId: 1,
                    tmdbMovieId: 27205,
                },
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId: 157336,
                },
            ];

            prisma.favorite.findMany.mockResolvedValue(
                favorites
            );

            const response = await request(app)
                .get("/favorites")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Favoriler getirildi.",
                data: favorites,
            });

            expect(
                prisma.favorite.findMany
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
    );


    test(
        "DELETE /favorites/157336 - filmi favorilerden başarıyla kaldırmalı",
        async () => {
            prisma.favorite.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            });

            prisma.favorite.delete.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            });

            const response = await request(app)
                .delete("/favorites/157336")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
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
                        tmdbMovieId: 157336,
                    },
                },
            });

            expect(
                prisma.favorite.delete
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
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

            const response = await request(app)
                .delete("/favorites/157336")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message: "Favori bulunamadı.",
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
            const response = await request(app)
                .post("/favorites")
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
            const response = await request(app)
                .post("/favorites")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: "abc",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
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
            const response = await request(app)
                .post("/favorites")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    tmdbMovieId: 0,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "tmdbMovieId 0'dan büyük olmalıdır."
            );

            expect(
                prisma.favorite.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /favorites/abc - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .delete("/favorites/abc")
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
            const response = await request(app)
                .delete("/favorites/0")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "TMDB film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.favorite.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /favorites - token olmadan 401 dönmeli",
        async () => {
            const response = await request(app)
                .get("/favorites");

            expect(response.statusCode).toBe(401);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Yetkilendirme başarısız.",
            });

            expect(
                prisma.favorite.findMany
            ).not.toHaveBeenCalled();
        }
    );
});