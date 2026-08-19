const request = require(
    "supertest"
);


// TMDB dış servisini mocklar
jest.mock(
    "../src/services/tmdb.service",
    () => ({
        getMovieDetailsBatch:
            jest.fn(),
    })
);


const tmdbService = require(
    "../src/services/tmdb.service"
);

const app = require(
    "../src/app"
);


describe(
    "TMDB Batch API",
    () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });


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