const request = require("supertest");

const prisma = require(
    "../../src/config/prisma"
);

const app = require(
    "../../src/app"
);


// Integration test kullanıcısı
const TEST_EMAIL =
    "library-user@movieshelf.test";

const TEST_PASSWORD =
    "GucluSifre123";

const MOVIE_ID = 157336;
const SECOND_MOVIE_ID = 27205;


let userId;
let authToken;


// Test kullanıcısını temizler
const deleteTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            email: TEST_EMAIL,
        },
    });
};


// Kullanıcının favori ve izleme listesi kayıtlarını temizler
const clearLibraryData = async () => {
    await prisma.favorite.deleteMany({
        where: {
            userId,
        },
    });

    await prisma.watchlist.deleteMany({
        where: {
            userId,
        },
    });
};


describe(
    "Favorite & Watchlist Integration",
    () => {
        beforeAll(async () => {
            await deleteTestUser();

            const registerResponse =
                await request(app)
                    .post("/auth/register")
                    .send({
                        name:
                            "Library Test User",
                        email:
                            TEST_EMAIL,
                        password:
                            TEST_PASSWORD,
                    });

            expect(
                registerResponse.statusCode
            ).toBe(201);


            const user =
                await prisma.user.findUnique({
                    where: {
                        email: TEST_EMAIL,
                    },
                });

            expect(user).not.toBeNull();

            userId = user.id;


            const loginResponse =
                await request(app)
                    .post("/auth/login")
                    .send({
                        email:
                            TEST_EMAIL,
                        password:
                            TEST_PASSWORD,
                    });

            expect(
                loginResponse.statusCode
            ).toBe(200);

            authToken =
                loginResponse.body.data.token;
        });


        beforeEach(async () => {
            await clearLibraryData();
        });


        afterAll(async () => {
            await deleteTestUser();

            await prisma.$disconnect();
        });


        /*
         * Favorite integration testleri
         */


        test(
            "POST /favorites - favoriyi gerçek DB'ye kaydetmeli",
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
                                MOVIE_ID,
                        });

                expect(
                    response.statusCode
                ).toBe(201);

                expect(
                    response.body
                ).toMatchObject({
                    success: true,
                    message:
                        "Film favorilere eklendi.",
                });


                const favorite =
                    await prisma.favorite
                        .findUnique({
                            where: {
                                userId_tmdbMovieId: {
                                    userId,
                                    tmdbMovieId:
                                        MOVIE_ID,
                                },
                            },
                        });

                expect(favorite)
                    .not.toBeNull();

                expect(
                    favorite.userId
                ).toBe(userId);

                expect(
                    favorite.tmdbMovieId
                ).toBe(MOVIE_ID);
            }
        );


        test(
            "POST /favorites - aynı filmi ikinci kez eklemeyi engellemeli",
            async () => {
                const firstResponse =
                    await request(app)
                        .post("/favorites")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                        });

                expect(
                    firstResponse.statusCode
                ).toBe(201);


                const secondResponse =
                    await request(app)
                        .post("/favorites")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                        });

                expect(
                    secondResponse.statusCode
                ).toBe(400);


                const count =
                    await prisma.favorite.count({
                        where: {
                            userId,
                            tmdbMovieId:
                                MOVIE_ID,
                        },
                    });

                expect(count).toBe(1);
            }
        );


        test(
            "GET /favorites - varsayılan pagination ile gerçek DB favorilerini getirmeli",
            async () => {
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                    });

                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            SECOND_MOVIE_ID,
                    });


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
                    response.body.data.items
                ).toHaveLength(2);

                expect(
                    response.body.data.pagination
                ).toEqual({
                    page: 1,
                    limit: 20,
                    totalItems: 2,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                });


                const movieIds =
                    response.body.data.items
                        .map(
                            (favorite) =>
                                favorite.tmdbMovieId
                        )
                        .sort(
                            (a, b) =>
                                a - b
                        );

                expect(movieIds).toEqual(
                    [
                        MOVIE_ID,
                        SECOND_MOVIE_ID,
                    ].sort(
                        (a, b) =>
                            a - b
                    )
                );
            }
        );


        test(
            "GET /favorites?page=2&limit=1 - gerçek DB'de ikinci sayfayı getirmeli",
            async () => {
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                    });

                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            SECOND_MOVIE_ID,
                    });


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
                    response.body.data.items
                ).toHaveLength(1);

                expect(
                    response.body.data.pagination
                ).toEqual({
                    page: 2,
                    limit: 1,
                    totalItems: 2,
                    totalPages: 2,
                    hasNextPage: false,
                    hasPreviousPage: true,
                });
            }
        );


        test(
            "GET /favorites - geçersiz pagination parametrelerini reddetmeli",
            async () => {
                const pageResponse =
                    await request(app)
                        .get(
                            "/favorites?page=0"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    pageResponse.statusCode
                ).toBe(400);


                const limitResponse =
                    await request(app)
                        .get(
                            "/favorites?limit=101"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    limitResponse.statusCode
                ).toBe(400);
            }
        );


        test(
            "DELETE /favorites/:tmdbMovieId - favoriyi gerçek DB'den silmeli",
            async () => {
                await request(app)
                    .post("/favorites")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                    });


                const response =
                    await request(app)
                        .delete(
                            `/favorites/${MOVIE_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    response.statusCode
                ).toBe(200);


                const favorite =
                    await prisma.favorite
                        .findUnique({
                            where: {
                                userId_tmdbMovieId: {
                                    userId,
                                    tmdbMovieId:
                                        MOVIE_ID,
                                },
                            },
                        });

                expect(favorite).toBeNull();
            }
        );


        test(
            "DELETE /favorites/:tmdbMovieId - bulunmayan favori için 404 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .delete(
                            `/favorites/${MOVIE_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    response.statusCode
                ).toBe(404);
            }
        );


        /*
         * Watchlist integration testleri
         */


        test(
            "POST /watchlist - filmi gerçek DB izleme listesine kaydetmeli",
            async () => {
                const response =
                    await request(app)
                        .post("/watchlist")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                        });

                expect(
                    response.statusCode
                ).toBe(201);


                const watchlist =
                    await prisma.watchlist
                        .findUnique({
                            where: {
                                userId_tmdbMovieId: {
                                    userId,
                                    tmdbMovieId:
                                        MOVIE_ID,
                                },
                            },
                        });

                expect(watchlist)
                    .not.toBeNull();

                expect(
                    watchlist.userId
                ).toBe(userId);

                expect(
                    watchlist.tmdbMovieId
                ).toBe(MOVIE_ID);
            }
        );


        test(
            "POST /watchlist - aynı filmi ikinci kez eklemeyi engellemeli",
            async () => {
                const firstResponse =
                    await request(app)
                        .post("/watchlist")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                        });

                expect(
                    firstResponse.statusCode
                ).toBe(201);


                const secondResponse =
                    await request(app)
                        .post("/watchlist")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                        });

                expect(
                    secondResponse.statusCode
                ).toBe(400);


                const count =
                    await prisma.watchlist
                        .count({
                            where: {
                                userId,
                                tmdbMovieId:
                                    MOVIE_ID,
                            },
                        });

                expect(count).toBe(1);
            }
        );


        test(
            "GET /watchlist - varsayılan pagination ile gerçek DB listesini getirmeli",
            async () => {
                await request(app)
                    .post("/watchlist")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                    });

                await request(app)
                    .post("/watchlist")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            SECOND_MOVIE_ID,
                    });


                const response =
                    await request(app)
                        .get("/watchlist")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    response.statusCode
                ).toBe(200);

                expect(
                    response.body.data.items
                ).toHaveLength(2);

                expect(
                    response.body.data.pagination
                ).toEqual({
                    page: 1,
                    limit: 20,
                    totalItems: 2,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                });


                const movieIds =
                    response.body.data.items
                        .map(
                            (watchlist) =>
                                watchlist.tmdbMovieId
                        )
                        .sort(
                            (a, b) =>
                                a - b
                        );

                expect(movieIds).toEqual(
                    [
                        MOVIE_ID,
                        SECOND_MOVIE_ID,
                    ].sort(
                        (a, b) =>
                            a - b
                    )
                );
            }
        );


        test(
            "GET /watchlist?page=2&limit=1 - gerçek DB'de ikinci sayfayı getirmeli",
            async () => {
                await request(app)
                    .post("/watchlist")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                    });

                await request(app)
                    .post("/watchlist")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            SECOND_MOVIE_ID,
                    });


                const response =
                    await request(app)
                        .get(
                            "/watchlist?page=2&limit=1"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    response.statusCode
                ).toBe(200);

                expect(
                    response.body.data.items
                ).toHaveLength(1);

                expect(
                    response.body.data.pagination
                ).toEqual({
                    page: 2,
                    limit: 1,
                    totalItems: 2,
                    totalPages: 2,
                    hasNextPage: false,
                    hasPreviousPage: true,
                });
            }
        );


        test(
            "GET /watchlist - geçersiz pagination parametrelerini reddetmeli",
            async () => {
                const pageResponse =
                    await request(app)
                        .get(
                            "/watchlist?page=0"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    pageResponse.statusCode
                ).toBe(400);


                const limitResponse =
                    await request(app)
                        .get(
                            "/watchlist?limit=101"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    limitResponse.statusCode
                ).toBe(400);
            }
        );


        test(
            "DELETE /watchlist/:tmdbMovieId - filmi gerçek DB izleme listesinden silmeli",
            async () => {
                await request(app)
                    .post("/watchlist")
                    .set(
                        "Authorization",
                        `Bearer ${authToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                    });


                const response =
                    await request(app)
                        .delete(
                            `/watchlist/${MOVIE_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    response.statusCode
                ).toBe(200);


                const watchlist =
                    await prisma.watchlist
                        .findUnique({
                            where: {
                                userId_tmdbMovieId: {
                                    userId,
                                    tmdbMovieId:
                                        MOVIE_ID,
                                },
                            },
                        });

                expect(watchlist).toBeNull();
            }
        );


        test(
            "DELETE /watchlist/:tmdbMovieId - listede olmayan film için 404 dönmeli",
            async () => {
                const response =
                    await request(app)
                        .delete(
                            `/watchlist/${MOVIE_ID}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );

                expect(
                    response.statusCode
                ).toBe(404);
            }
        );
    }
);