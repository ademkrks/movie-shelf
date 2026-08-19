const request = require(
    "supertest"
);


// TMDB dış servisini mocklar
jest.mock(
    "../src/services/tmdb.service",
    () => ({
        getTrendingMovies:
            jest.fn(),

        getPopularMovies:
            jest.fn(),

        getTopRatedMovies:
            jest.fn(),

        getUpcomingMovies:
            jest.fn(),

        searchMovies:
            jest.fn(),

        getMovieDetails:
            jest.fn(),

        getMovieCast:
            jest.fn(),

        getMovieTrailers:
            jest.fn(),
    })
);


const tmdbService = require(
    "../src/services/tmdb.service"
);

const app = require(
    "../src/app"
);


describe("TMDB API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    test(
        "GET /tmdb/search - page ile arama sonuçlarını ve pagination bilgisini getirmeli",
        async () => {
            const result = {
                items: [
                    {
                        id: 157336,
                        title:
                            "Interstellar",
                    },
                ],

                pagination: {
                    page: 2,
                    totalPages: 5,
                    totalItems: 92,
                    hasNextPage: true,
                    hasPreviousPage: true,
                },
            };


            tmdbService
                .searchMovies
                .mockResolvedValue(
                    result
                );


            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
                    )
                    .query({
                        q:
                            "  Interstellar  ",
                        page: 2,
                    });


            expect(
                response.statusCode
            ).toBe(200);


            expect(
                response.body
            ).toEqual({
                success: true,
                message:
                    "Arama sonuçları getirildi.",
                data: result,
            });


            expect(
                tmdbService
                    .searchMovies
            ).toHaveBeenCalledWith(
                "Interstellar",
                2
            );
        }
    );


    test(
        "GET /tmdb/search - q olmadan 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
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
                "Arama sorgusu zorunludur."
            );


            expect(
                tmdbService
                    .searchMovies
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /tmdb/search - boş q için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
                    )
                    .query({
                        q: "   ",
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
                "Arama sorgusu boş bırakılamaz."
            );
        }
    );


    test(
        "GET /tmdb/search - tek karakter q için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
                    )
                    .query({
                        q: "a",
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.errors
            ).toContain(
                "Arama sorgusu en az 2 karakter olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/search - 100 karakter üzeri q için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
                    )
                    .query({
                        q:
                            "a".repeat(
                                101
                            ),
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.errors
            ).toContain(
                "Arama sorgusu en fazla 100 karakter olabilir."
            );
        }
    );


    test(
        "GET /tmdb/search?page=0 - geçersiz page için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
                    )
                    .query({
                        q:
                            "Interstellar",
                        page: 0,
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.errors
            ).toContain(
                "Sayfa numarası 0'dan büyük olmalıdır."
            );


            expect(
                tmdbService
                    .searchMovies
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /tmdb/search?page=abc - sayısal olmayan page için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/search"
                    )
                    .query({
                        q:
                            "Interstellar",
                        page:
                            "abc",
                    });


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.errors
            ).toContain(
                "Sayfa numarası geçerli bir tam sayı olmalıdır."
            );


            expect(
                tmdbService
                    .searchMovies
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "GET /tmdb/movie/abc - geçersiz film ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/movie/abc"
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
                "Film ID geçerli bir sayı olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/movie/0 - sıfır film ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/movie/0"
                    );


            expect(
                response.statusCode
            ).toBe(400);


            expect(
                response.body.errors
            ).toContain(
                "Film ID 0'dan büyük olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/movie/abc/cast - geçersiz film ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/movie/abc/cast"
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
                "Film ID geçerli bir sayı olmalıdır."
            );
        }
    );


    test(
        "GET /tmdb/movie/abc/trailers - geçersiz film ID için 400 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get(
                        "/tmdb/movie/abc/trailers"
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
                "Film ID geçerli bir sayı olmalıdır."
            );
        }
    );
});