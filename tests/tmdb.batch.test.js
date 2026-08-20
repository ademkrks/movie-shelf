const request = require(
    "supertest"
);


// Gerçek veritabanı yerine Prisma mock kullanır
jest.mock(
    "../src/config/prisma",
    () => ({
        user: {
            findUnique:
                jest.fn(),
        },
    })
);


// TMDB dış servisini mocklar
jest.mock(
    "../src/services/tmdb.service",
    () => ({
        getMovieDetailsBatch:
            jest.fn(),
    })
);


const prisma = require(
    "../src/config/prisma"
);

const tmdbService = require(
    "../src/services/tmdb.service"
);

const generateToken = require(
    "../src/utils/generateToken"
);

const app = require(
    "../src/app"
);


describe(
    "TMDB Batch API",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();

            prisma.user.findUnique
                .mockResolvedValue({
                    id: 1,
                    name: "Ali",
                    email:
                        "ali@example.com",
                    role: "USER",
                    tokenVersion: 0,
                    createdAt:
                        new Date(
                            "2026-08-20T10:00:00.000Z"
                        ),
                });
        });


        const createAuthorization =
            () => {
                return `Bearer ${generateToken(
                    1,
                    0
                )}`;
            };


        test(
            "POST /tmdb/movies/batch - token olmadan 401 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .post(
                            "/tmdb/movies/batch"
                        )
                        .send({
                            movieIds: [
                                157336,
                            ],
                        });


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
                    tmdbService
                        .getMovieDetailsBatch
                ).not
                    .toHaveBeenCalled();
            }
        );


        test(
            "POST /tmdb/movies/batch - film detaylarını toplu getirmeli",
            async () => {
                const result = {
                    items: [
                        {
                            id: 157336,
                            title:
                                "Interstellar",
                        },
                        {
                            id: 27205,
                            title:
                                "Inception",
                        },
                    ],

                    failedMovieIds:
                        [],
                };


                tmdbService
                    .getMovieDetailsBatch
                    .mockResolvedValue(
                        result
                    );


                const response =
                    await request(app)
                        .post(
                            "/tmdb/movies/batch"
                        )
                        .set(
                            "Authorization",
                            createAuthorization()
                        )
                        .send({
                            movieIds: [
                                157336,
                                27205,
                            ],
                        });


                expect(
                    response.statusCode
                ).toBe(200);


                expect(
                    response.body
                ).toEqual({
                    success: true,

                    message:
                        "Film detayları getirildi.",

                    data:
                        result,
                });


                expect(
                    tmdbService
                        .getMovieDetailsBatch
                ).toHaveBeenCalledWith(
                    [
                        157336,
                        27205,
                    ]
                );
            }
        );


        test(
            "POST /tmdb/movies/batch - movieIds olmadan 400 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .post(
                            "/tmdb/movies/batch"
                        )
                        .set(
                            "Authorization",
                            createAuthorization()
                        )
                        .send({});


                expect(
                    response.statusCode
                ).toBe(400);


                expect(
                    response.body
                        .errors
                ).toContain(
                    "Film ID listesi zorunludur."
                );


                expect(
                    tmdbService
                        .getMovieDetailsBatch
                ).not
                    .toHaveBeenCalled();
            }
        );


        test(
            "POST /tmdb/movies/batch - boş liste için 400 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .post(
                            "/tmdb/movies/batch"
                        )
                        .set(
                            "Authorization",
                            createAuthorization()
                        )
                        .send({
                            movieIds: [],
                        });


                expect(
                    response.statusCode
                ).toBe(400);


                expect(
                    response.body
                        .errors
                ).toContain(
                    "En az bir film ID gönderilmelidir."
                );


                expect(
                    tmdbService
                        .getMovieDetailsBatch
                ).not
                    .toHaveBeenCalled();
            }
        );


        test(
            "POST /tmdb/movies/batch - 20 üzeri film için 400 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .post(
                            "/tmdb/movies/batch"
                        )
                        .set(
                            "Authorization",
                            createAuthorization()
                        )
                        .send({
                            movieIds:
                                Array.from(
                                    {
                                        length:
                                            21,
                                    },
                                    (
                                        _,
                                        index
                                    ) =>
                                        index +
                                        1
                                ),
                        });


                expect(
                    response.statusCode
                ).toBe(400);


                expect(
                    response.body
                        .errors
                ).toContain(
                    "Tek istekte en fazla 20 film ID gönderilebilir."
                );


                expect(
                    tmdbService
                        .getMovieDetailsBatch
                ).not
                    .toHaveBeenCalled();
            }
        );


        test(
            "POST /tmdb/movies/batch - geçersiz film ID için 400 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .post(
                            "/tmdb/movies/batch"
                        )
                        .set(
                            "Authorization",
                            createAuthorization()
                        )
                        .send({
                            movieIds: [
                                157336,
                                0,
                            ],
                        });


                expect(
                    response.statusCode
                ).toBe(400);


                expect(
                    response.body
                        .errors
                ).toContain(
                    "Tüm film ID'leri 0'dan büyük tam sayı olmalıdır."
                );


                expect(
                    tmdbService
                        .getMovieDetailsBatch
                ).not
                    .toHaveBeenCalled();
            }
        );
    }
);