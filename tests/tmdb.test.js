const request = require("supertest");

const app = require("../src/app");


describe("TMDB API", () => {
    test(
        "GET /tmdb/search - q olmadan 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/search");

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Arama sorgusu zorunludur."
            );
        }
    );


    test(
        "GET /tmdb/search - boş q için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/search")
                .query({
                    q: "   ",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Arama sorgusu boş bırakılamaz."
            );
        }
    );


    test(
        "GET /tmdb/search - tek karakter q için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/search")
                .query({
                    q: "a",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Arama sorgusu en az 2 karakter olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/search - 100 karakter üzeri q için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/search")
                .query({
                    q: "a".repeat(101),
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Arama sorgusu en fazla 100 karakter olabilir."
            );
        }
    );


    test(
        "GET /tmdb/movie/abc - geçersiz film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/movie/abc");

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Film ID geçerli bir sayı olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/movie/0 - sıfır film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/movie/0");

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Film ID 0'dan büyük olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/movie/abc/cast - geçersiz film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/movie/abc/cast");

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Film ID geçerli bir sayı olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/movie/abc/trailers - geçersiz film ID için 400 dönmeli",
        async () => {
            const response = await request(app)
                .get("/tmdb/movie/abc/trailers");

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Film ID geçerli bir sayı olmalıdır."
            );
        }
    );
});