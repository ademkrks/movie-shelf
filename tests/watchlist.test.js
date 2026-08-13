const request = require("supertest");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
    },

    watchlist: {
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


describe("Watchlist API", () => {
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
        "POST /watchlist - filmi izleme listesine başarıyla eklemeli",
        async () => {
            prisma.watchlist.findUnique.mockResolvedValue(
                null
            );

            const createdWatchlist = {
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            };

            prisma.watchlist.create.mockResolvedValue(
                createdWatchlist
            );

            const response = await request(app)
                .post("/watchlist")
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
                    "Film izleme listesine eklendi.",
                data: createdWatchlist,
            });

            expect(
                prisma.watchlist.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
                    },
                },
            });

            expect(
                prisma.watchlist.create
            ).toHaveBeenCalledWith({
                data: {
                    userId: 1,
                    tmdbMovieId: 157336,
                },
            });
        }
    );


    test(
        "POST /watchlist - film zaten izleme listesindeyse 400 dönmeli",
        async () => {
            prisma.watchlist.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            });

            const response = await request(app)
                .post("/watchlist")
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
                    "Film zaten izleme listesinde.",
            });

            expect(
                prisma.watchlist.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /watchlist - varsayılan pagination ile listeyi getirmeli",
        async () => {
            const watchlist = [
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

            prisma.watchlist.findMany.mockResolvedValue(
                watchlist
            );

            prisma.watchlist.count.mockResolvedValue(
                2
            );

            const response = await request(app)
                .get("/watchlist")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "İzleme listesi getirildi.",
                data: {
                    items: watchlist,
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
                prisma.watchlist.findMany
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: 0,
                take: 20,
            });

            expect(
                prisma.watchlist.count
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                },
            });
        }
    );


    test(
        "GET /watchlist?page=2&limit=1 - doğru sayfayı istemeli",
        async () => {
            const watchlist = [
                {
                    id: 1,
                    userId: 1,
                    tmdbMovieId: 157336,
                },
            ];

            prisma.watchlist.findMany.mockResolvedValue(
                watchlist
            );

            prisma.watchlist.count.mockResolvedValue(
                2
            );

            const response = await request(app)
                .get(
                    "/watchlist?page=2&limit=1"
                )
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body.data).toEqual({
                items: watchlist,
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
                prisma.watchlist.findMany
            ).toHaveBeenCalledWith({
                where: {
                    userId: 1,
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
        "DELETE /watchlist/157336 - filmi izleme listesinden başarıyla kaldırmalı",
        async () => {
            prisma.watchlist.findUnique.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            });

            prisma.watchlist.delete.mockResolvedValue({
                id: 1,
                userId: 1,
                tmdbMovieId: 157336,
            });

            const response = await request(app)
                .delete("/watchlist/157336")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film izleme listesinden kaldırıldı.",
                data: null,
            });

            expect(
                prisma.watchlist.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    userId_tmdbMovieId: {
                        userId: 1,
                        tmdbMovieId: 157336,
                    },
                },
            });

            expect(
                prisma.watchlist.delete
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
        "DELETE /watchlist/157336 - film listede bulunamazsa 404 dönmeli",
        async () => {
            prisma.watchlist.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .delete("/watchlist/157336")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message:
                    "Film izleme listesinde bulunamadı.",
            });

            expect(
                prisma.watchlist.delete
            ).not.toHaveBeenCalled();
        }
    );


    /*
     * Validation ve authentication testleri
     */


    test(
        "POST /watchlist - tmdbMovieId olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/watchlist")
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
                prisma.watchlist.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /watchlist - geçersiz tmdbMovieId için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/watchlist")
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
                prisma.watchlist.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /watchlist - sıfır tmdbMovieId için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/watchlist")
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
                prisma.watchlist.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /watchlist/abc - geçersiz TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .delete("/watchlist/abc")
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
                prisma.watchlist.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /watchlist/0 - sıfır TMDB ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .delete("/watchlist/0")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "TMDB film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.watchlist.delete
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /watchlist?page=0 - geçersiz page için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/watchlist?page=0")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Sayfa numarası 0'dan büyük olmalıdır."
            );

            expect(
                prisma.watchlist.findMany
            ).not.toHaveBeenCalled();

            expect(
                prisma.watchlist.count
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /watchlist?page=abc - metin page için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/watchlist?page=abc")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Sayfa numarası geçerli bir tam sayı olmalıdır."
            );
        }
    );


    test(
        "GET /watchlist?limit=101 - maksimum limit aşılırsa 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/watchlist?limit=101")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Limit en fazla 100 olabilir."
            );
        }
    );


    test(
        "GET /watchlist?limit=abc - metin limit için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/watchlist?limit=abc")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Limit geçerli bir tam sayı olmalıdır."
            );
        }
    );


    test(
        "GET /watchlist - token olmadan 401 dönmeli",
        async () => {
            const response = await request(app)
                .get("/watchlist");

            expect(response.statusCode).toBe(401);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message:
                    "Yetkilendirme başarısız.",
            });

            expect(
                prisma.watchlist.findMany
            ).not.toHaveBeenCalled();
        }
    );
});