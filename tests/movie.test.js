const request = require("supertest");
const jwt = require("jsonwebtoken");


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
    },

    movie: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
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


describe("Movie API", () => {
    let authToken;


    beforeEach(() => {
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
     * Başarılı endpoint testleri
     */


    test(
        "GET /movies - film listesini başarıyla getirmeli",
        async () => {
            const movies = [
                {
                    id: 1,
                    title: "Interstellar",
                    year: 2014,
                },
                {
                    id: 2,
                    title: "Inception",
                    year: 2010,
                },
            ];

            prisma.movie.findMany.mockResolvedValue(
                movies
            );

            const response = await request(app)
                .get("/movies");

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Liste başarıyla getirildi.",
                count: 2,
                data: movies,
            });

            expect(
                prisma.movie.findMany
            ).toHaveBeenCalledWith({
                orderBy: {
                    id: "asc",
                },
            });
        }
    );


    test(
        "GET /movies/1 - filmi ID ile başarıyla getirmeli",
        async () => {
            const movie = {
                id: 1,
                title: "Interstellar",
                year: 2014,
            };

            prisma.movie.findUnique.mockResolvedValue(
                movie
            );

            const response = await request(app)
                .get("/movies/1");

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film başarıyla getirildi.",
                data: movie,
            });

            expect(
                prisma.movie.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
        }
    );


    test(
        "GET /movies/999 - film bulunamazsa 404 dönmeli",
        async () => {
            prisma.movie.findUnique.mockResolvedValue(
                null
            );

            const response = await request(app)
                .get("/movies/999");

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                success: false,
                status: "fail",
                message: "Film bulunamadı.",
            });

            expect(
                prisma.movie.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: 999,
                },
            });
        }
    );


    test(
        "POST /movies - filmi başarıyla oluşturmalı",
        async () => {
            const createdMovie = {
                id: 1,
                title: "Interstellar",
                year: 2014,
            };

            prisma.movie.create.mockResolvedValue(
                createdMovie
            );

            const response = await request(app)
                .post("/movies")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "Interstellar",
                    year: 2014,
                });

            expect(response.statusCode).toBe(201);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film başarıyla oluşturuldu.",
                data: createdMovie,
            });

            expect(
                prisma.movie.create
            ).toHaveBeenCalledWith({
                data: {
                    title: "Interstellar",
                    year: 2014,
                },
            });
        }
    );


    test(
        "PUT /movies/1 - filmi başarıyla güncellemeli",
        async () => {
            const updatedMovie = {
                id: 1,
                title: "Interstellar Updated",
                year: 2014,
            };

            prisma.movie.update.mockResolvedValue(
                updatedMovie
            );

            const response = await request(app)
                .put("/movies/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "Interstellar Updated",
                    year: 2014,
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film başarıyla güncellendi.",
                data: updatedMovie,
            });

            expect(
                prisma.movie.update
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                data: {
                    title:
                        "Interstellar Updated",
                    year: 2014,
                },
            });
        }
    );


    test(
        "DELETE /movies/1 - filmi başarıyla silmeli",
        async () => {
            prisma.movie.delete.mockResolvedValue({
                id: 1,
                title: "Interstellar",
                year: 2014,
            });

            const response = await request(app)
                .delete("/movies/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                success: true,
                message:
                    "Film başarıyla silindi.",
                data: null,
            });

            expect(
                prisma.movie.delete
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
        }
    );


    /*
     * Validation testleri
     */


    test(
        "POST /movies - boş title için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/movies")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "",
                    year: 2020,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "title alanı boş bırakılamaz."
            );

            expect(
                prisma.movie.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /movies - title olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/movies")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    year: 2020,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(
                prisma.movie.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /movies - geçersiz year için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/movies")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "Interstellar",
                    year: "abc",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "year alanı geçerli bir tam sayı olmalıdır."
            );

            expect(
                prisma.movie.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "POST /movies - 1888 öncesi year için 400 dönmeli",
        async () => {
            const response = await request(app)
                .post("/movies")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "Test Movie",
                    year: 1800,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(
                false
            );

            expect(response.body.status).toBe(
                "fail"
            );

            expect(
                prisma.movie.create
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /movies/abc - geçersiz film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/movies/abc");

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Film ID geçerli bir sayı olmalıdır."
            );

            expect(
                prisma.movie.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /movies/0 - sıfır film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/movies/0");

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Film ID 0'dan büyük olmalıdır."
            );

            expect(
                prisma.movie.findUnique
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /movies/abc - geçersiz film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/movies/abc")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "Interstellar",
                    year: 2014,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(
                prisma.movie.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "PUT /movies/1 - geçersiz body için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/movies/1")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    title: "",
                    year: 2014,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(
                prisma.movie.update
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "DELETE /movies/abc - geçersiz film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .delete("/movies/abc")
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

            expect(
                prisma.movie.delete
            ).not.toHaveBeenCalled();
        }
    );
});