const request = require("supertest");

const prisma = require(
    "../../src/config/prisma"
);

const app = require(
    "../../src/app"
);


// Integration test kullanıcısı
const TEST_EMAIL =
    "rbac-user@movieshelf.test";

const TEST_PASSWORD =
    "GucluSifre123";

const TEST_MOVIE_TITLE =
    "RBAC Integration Movie";


let userId;
let authToken;


// Test verilerini temizler
const cleanup = async () => {
    await prisma.movie.deleteMany({
        where: {
            title: {
                startsWith:
                    TEST_MOVIE_TITLE,
            },
        },
    });

    await prisma.user.deleteMany({
        where: {
            email: TEST_EMAIL,
        },
    });
};


// Kullanıcının rolünü gerçek DB'de değiştirir
const setRole = async (role) => {
    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role,
        },
    });
};


describe(
    "RBAC Integration",
    () => {
        beforeAll(async () => {
            await cleanup();


            // Kullanıcı gerçek API üzerinden oluşturulur
            const registerResponse =
                await request(app)
                    .post("/auth/register")
                    .send({
                        name:
                            "RBAC Test User",
                        email:
                            TEST_EMAIL,
                        password:
                            TEST_PASSWORD,
                    });

            expect(
                registerResponse.statusCode
            ).toBe(201);


            // Kullanıcı gerçek DB'den alınır
            const user =
                await prisma.user.findUnique({
                    where: {
                        email:
                            TEST_EMAIL,
                    },
                });

            expect(user).not.toBeNull();

            userId = user.id;

            // Yeni kullanıcı varsayılan USER olmalıdır
            expect(user.role).toBe("USER");


            // USER rolündeyken JWT alınır
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
            // Her test USER olarak başlar
            await setRole("USER");

            await prisma.movie.deleteMany({
                where: {
                    title: {
                        startsWith:
                            TEST_MOVIE_TITLE,
                    },
                },
            });
        });


        afterAll(async () => {
            await cleanup();

            await prisma.$disconnect();
        });


        test(
            "POST /movies - USER rolündeki kullanıcı film oluşturamamalı",
            async () => {
                const response =
                    await request(app)
                        .post("/movies")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            title:
                                TEST_MOVIE_TITLE,
                            year: 2026,
                        });


                expect(
                    response.statusCode
                ).toBe(403);

                expect(
                    response.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Bu işlem için yetkiniz yok.",
                });


                // Yetkisiz işlem DB'ye ulaşmamalıdır
                const movie =
                    await prisma.movie
                        .findFirst({
                            where: {
                                title:
                                    TEST_MOVIE_TITLE,
                            },
                        });


                expect(movie).toBeNull();
            }
        );


        test(
            "POST /movies - DB'de ADMIN yapılan kullanıcı aynı JWT ile film oluşturabilmeli",
            async () => {
                /*
                 * JWT USER iken alınmış olmasına rağmen
                 * role JWT'den değil gerçek DB'den okunur.
                 */
                await setRole("ADMIN");


                const response =
                    await request(app)
                        .post("/movies")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            title:
                                TEST_MOVIE_TITLE,
                            year: 2026,
                        });


                expect(
                    response.statusCode
                ).toBe(201);

                expect(
                    response.body
                ).toMatchObject({
                    success: true,
                    message:
                        "Film başarıyla oluşturuldu.",
                    data: {
                        title:
                            TEST_MOVIE_TITLE,
                        year: 2026,
                    },
                });


                // Film gerçekten PostgreSQL'e yazılmış olmalıdır
                const movie =
                    await prisma.movie
                        .findUnique({
                            where: {
                                id:
                                    response.body
                                        .data.id,
                            },
                        });


                expect(movie)
                    .not.toBeNull();

                expect(movie.title)
                    .toBe(
                        TEST_MOVIE_TITLE
                    );
            }
        );


        test(
            "ADMIN filmi gerçek DB'de güncelleyebilmeli ve silebilmeli",
            async () => {
                await setRole("ADMIN");


                // Film ADMIN endpoint üzerinden oluşturulur
                const createResponse =
                    await request(app)
                        .post("/movies")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            title:
                                TEST_MOVIE_TITLE,
                            year: 2026,
                        });


                expect(
                    createResponse.statusCode
                ).toBe(201);

                const movieId =
                    createResponse.body.data.id;


                // Güncelleme
                const updateResponse =
                    await request(app)
                        .put(
                            `/movies/${movieId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            title:
                                `${TEST_MOVIE_TITLE} Updated`,
                            year: 2025,
                        });


                expect(
                    updateResponse.statusCode
                ).toBe(200);

                expect(
                    updateResponse.body
                        .data.title
                ).toBe(
                    `${TEST_MOVIE_TITLE} Updated`
                );

                expect(
                    updateResponse.body
                        .data.year
                ).toBe(2025);


                const updatedMovie =
                    await prisma.movie
                        .findUnique({
                            where: {
                                id: movieId,
                            },
                        });


                expect(
                    updatedMovie.title
                ).toBe(
                    `${TEST_MOVIE_TITLE} Updated`
                );

                expect(
                    updatedMovie.year
                ).toBe(2025);


                // Silme
                const deleteResponse =
                    await request(app)
                        .delete(
                            `/movies/${movieId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    deleteResponse.statusCode
                ).toBe(200);

                expect(
                    deleteResponse.body
                ).toEqual({
                    success: true,
                    message:
                        "Film başarıyla silindi.",
                    data: null,
                });


                const deletedMovie =
                    await prisma.movie
                        .findUnique({
                            where: {
                                id: movieId,
                            },
                        });


                expect(
                    deletedMovie
                ).toBeNull();
            }
        );


        test(
            "ADMIN rolü USER'a düşürüldüğünde aynı JWT admin yetkisini kaybetmeli",
            async () => {
                // Önce ADMIN yapılır
                await setRole("ADMIN");


                const createResponse =
                    await request(app)
                        .post("/movies")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            title:
                                TEST_MOVIE_TITLE,
                            year: 2026,
                        });


                expect(
                    createResponse.statusCode
                ).toBe(201);

                const movieId =
                    createResponse.body.data.id;


                /*
                 * Kullanıcı tekrar USER yapılır.
                 * JWT değişmez.
                 */
                await setRole("USER");


                const deleteResponse =
                    await request(app)
                        .delete(
                            `/movies/${movieId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    deleteResponse.statusCode
                ).toBe(403);

                expect(
                    deleteResponse.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Bu işlem için yetkiniz yok.",
                });


                /*
                 * Yetkisiz DELETE başarısız olduğu için
                 * film DB'de hâlâ bulunmalıdır.
                 */
                const movie =
                    await prisma.movie
                        .findUnique({
                            where: {
                                id: movieId,
                            },
                        });


                expect(movie)
                    .not.toBeNull();
            }
        );
    }
);