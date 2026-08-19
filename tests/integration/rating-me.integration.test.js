const request = require("supertest");

const prisma = require(
    "../../src/config/prisma"
);

const app = require(
    "../../src/app"
);


// Integration test kullanıcısı
const TEST_USER_EMAIL =
    "rating-me-user@movieshelf.test";

const TEST_PASSWORD =
    "GucluSifre123";

const MOVIE_ID = 157336;


// Test kullanıcısını ve ilişkili verileri temizler
const deleteTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            email: TEST_USER_EMAIL,
        },
    });
};


// Kullanıcı oluşturur
const registerUser = async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            name:
                "Rating Me User",

            email:
                TEST_USER_EMAIL,

            password:
                TEST_PASSWORD,
        });


    expect(
        response.statusCode
    ).toBe(201);
};


// Kullanıcı giriş tokenını alır
const loginUser = async () => {
    const response = await request(app)
        .post("/auth/login")
        .send({
            email:
                TEST_USER_EMAIL,

            password:
                TEST_PASSWORD,
        });


    expect(
        response.statusCode
    ).toBe(200);


    return response.body.data.token;
};


describe(
    "Rating Me Integration",
    () => {
        let authToken;


        beforeAll(async () => {
            /*
             * Önceki başarısız test çalışmasından
             * veri kaldıysa temizler.
             */
            await deleteTestUser();


            await registerUser();

            authToken =
                await loginUser();
        });


        afterAll(async () => {
            await deleteTestUser();

            await prisma.$disconnect();
        });


        test(
            "GET /ratings/movie/:tmdbMovieId/me - rating lifecycle gerçek DB üzerinde doğru çalışmalı",
            async () => {
                /*
                 * Kullanıcı henüz filme
                 * puan vermemiş olmalı.
                 */
                const emptyResponse =
                    await request(app)
                        .get(
                            `/ratings/movie/${MOVIE_ID}/me`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    emptyResponse.statusCode
                ).toBe(200);

                expect(
                    emptyResponse.body
                ).toEqual({
                    success: true,
                    message:
                        "Kullanıcının film puanı getirildi.",
                    data: null,
                });


                /*
                 * Filme ilk puan eklenir.
                 */
                const createResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,

                            rating: 8,
                        });


                expect(
                    createResponse.statusCode
                ).toBe(201);

                expect(
                    createResponse.body.success
                ).toBe(true);


                const ratingId =
                    createResponse.body.data.id;


                /*
                 * /me endpointi eklenen
                 * puanı doğrudan bulmalı.
                 */
                const createdRatingResponse =
                    await request(app)
                        .get(
                            `/ratings/movie/${MOVIE_ID}/me`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    createdRatingResponse.statusCode
                ).toBe(200);

                expect(
                    createdRatingResponse.body
                        .data
                ).toEqual({
                    id: ratingId,
                    tmdbMovieId:
                        MOVIE_ID,
                    rating: 8,
                });


                /*
                 * Kullanıcının puanı güncellenir.
                 */
                const updateResponse =
                    await request(app)
                        .put(
                            `/ratings/${ratingId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        )
                        .send({
                            rating: 10,
                        });


                expect(
                    updateResponse.statusCode
                ).toBe(200);


                /*
                 * /me endpointi güncel
                 * puanı döndürmeli.
                 */
                const updatedRatingResponse =
                    await request(app)
                        .get(
                            `/ratings/movie/${MOVIE_ID}/me`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    updatedRatingResponse.statusCode
                ).toBe(200);

                expect(
                    updatedRatingResponse.body
                        .data
                ).toEqual({
                    id: ratingId,
                    tmdbMovieId:
                        MOVIE_ID,
                    rating: 10,
                });


                /*
                 * Rating gerçek DB'den silinir.
                 */
                const deleteResponse =
                    await request(app)
                        .delete(
                            `/ratings/${ratingId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    deleteResponse.statusCode
                ).toBe(200);


                /*
                 * Silme işleminden sonra
                 * endpoint tekrar null dönmeli.
                 */
                const deletedRatingResponse =
                    await request(app)
                        .get(
                            `/ratings/movie/${MOVIE_ID}/me`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${authToken}`
                        );


                expect(
                    deletedRatingResponse.statusCode
                ).toBe(200);

                expect(
                    deletedRatingResponse.body
                        .data
                ).toBeNull();


                /*
                 * Son olarak gerçek DB'de
                 * kaydın kalmadığını doğrular.
                 */
                const user =
                    await prisma.user
                        .findUnique({
                            where: {
                                email:
                                    TEST_USER_EMAIL,
                            },
                        });


                const databaseRating =
                    await prisma.rating
                        .findUnique({
                            where: {
                                userId_tmdbMovieId: {
                                    userId:
                                        user.id,

                                    tmdbMovieId:
                                        MOVIE_ID,
                                },
                            },
                        });


                expect(
                    databaseRating
                ).toBeNull();
            }
        );
    }
);