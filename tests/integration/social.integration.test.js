const request = require("supertest");

const prisma = require(
    "../../src/config/prisma"
);

const app = require(
    "../../src/app"
);


// Integration test kullanıcıları
const USER_ONE_EMAIL =
    "social-user-one@movieshelf.test";

const USER_TWO_EMAIL =
    "social-user-two@movieshelf.test";

const TEST_PASSWORD =
    "GucluSifre123";

const MOVIE_ID = 157336;


let userOne;
let userTwo;

let userOneToken;
let userTwoToken;


// Test kullanıcılarını temizler
const deleteTestUsers = async () => {
    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    USER_ONE_EMAIL,
                    USER_TWO_EMAIL,
                ],
            },
        },
    });
};


// Review ve Rating test verilerini temizler
const clearSocialData = async () => {
    if (!userOne || !userTwo) {
        return;
    }

    const userIds = [
        userOne.id,
        userTwo.id,
    ];

    await prisma.review.deleteMany({
        where: {
            userId: {
                in: userIds,
            },
        },
    });

    await prisma.rating.deleteMany({
        where: {
            userId: {
                in: userIds,
            },
        },
    });
};


// Kullanıcı oluşturur
const registerUser = async (
    name,
    email
) => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            name,
            email,
            password: TEST_PASSWORD,
        });

    expect(response.statusCode).toBe(201);
};


// Kullanıcı login işlemi
const loginUser = async (email) => {
    const response = await request(app)
        .post("/auth/login")
        .send({
            email,
            password: TEST_PASSWORD,
        });

    expect(response.statusCode).toBe(200);

    return response.body.data.token;
};


describe(
    "Review & Rating Integration",
    () => {
        beforeAll(async () => {
            await deleteTestUsers();


            // Birinci kullanıcı oluşturulur
            await registerUser(
                "Social User One",
                USER_ONE_EMAIL
            );


            // İkinci kullanıcı oluşturulur
            await registerUser(
                "Social User Two",
                USER_TWO_EMAIL
            );


            // Kullanıcılar gerçek DB'den alınır
            userOne =
                await prisma.user.findUnique({
                    where: {
                        email:
                            USER_ONE_EMAIL,
                    },
                });

            userTwo =
                await prisma.user.findUnique({
                    where: {
                        email:
                            USER_TWO_EMAIL,
                    },
                });


            expect(userOne).not.toBeNull();
            expect(userTwo).not.toBeNull();


            // Gerçek login tokenları alınır
            userOneToken =
                await loginUser(
                    USER_ONE_EMAIL
                );

            userTwoToken =
                await loginUser(
                    USER_TWO_EMAIL
                );
        });


        beforeEach(async () => {
            await clearSocialData();
        });


        afterAll(async () => {
            await deleteTestUsers();

            await prisma.$disconnect();
        });


        /*
         * Review Integration
         */


        test(
            "POST /reviews - yorumu gerçek DB'ye kaydetmeli",
            async () => {
                const response =
                    await request(app)
                        .post("/reviews")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            content:
                                "   Harika bir film.   ",
                        });


                expect(
                    response.statusCode
                ).toBe(201);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.message
                ).toBe(
                    "Yorum başarıyla eklendi."
                );


                const review =
                    await prisma.review
                        .findUnique({
                            where: {
                                id:
                                    response.body
                                        .data.id,
                            },
                        });


                expect(review)
                    .not.toBeNull();

                expect(
                    review.userId
                ).toBe(userOne.id);

                expect(
                    review.tmdbMovieId
                ).toBe(MOVIE_ID);

                /*
                 * Service trim işleminin
                 * gerçek DB'ye yansıdığını doğrular.
                 */
                expect(
                    review.content
                ).toBe(
                    "Harika bir film."
                );
            }
        );


        test(
            "GET /reviews/movie/:tmdbMovieId - gerçek DB yorumlarını kullanıcı bilgileriyle getirmeli",
            async () => {
                await request(app)
                    .post("/reviews")
                    .set(
                        "Authorization",
                        `Bearer ${userOneToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                        content:
                            "Birinci yorum.",
                    });


                await request(app)
                    .post("/reviews")
                    .set(
                        "Authorization",
                        `Bearer ${userTwoToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                        content:
                            "İkinci yorum.",
                    });


                const response =
                    await request(app)
                        .get(
                            `/reviews/movie/${MOVIE_ID}`
                        );


                expect(
                    response.statusCode
                ).toBe(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.data
                ).toHaveLength(2);


                const userIds =
                    response.body.data
                        .map(
                            (review) =>
                                review.user.id
                        );


                expect(userIds).toContain(
                    userOne.id
                );

                expect(userIds).toContain(
                    userTwo.id
                );


                /*
                 * API yalnızca gerekli kullanıcı
                 * bilgilerini döndürmelidir.
                 */
                response.body.data.forEach(
                    (review) => {
                        expect(
                            review.user.id
                        ).toBeDefined();

                        expect(
                            review.user.name
                        ).toBeDefined();

                        expect(
                            review.user.password
                        ).toBeUndefined();
                    }
                );
            }
        );


        test(
            "PUT /reviews/:id - kullanıcı kendi yorumunu gerçek DB'de güncelleyebilmeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/reviews")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            content:
                                "Eski yorum.",
                        });


                const reviewId =
                    createResponse.body.data.id;


                const updateResponse =
                    await request(app)
                        .put(
                            `/reviews/${reviewId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            content:
                                "   Güncellenmiş yorum.   ",
                        });


                expect(
                    updateResponse.statusCode
                ).toBe(200);

                expect(
                    updateResponse.body.message
                ).toBe(
                    "Yorum güncellendi."
                );


                const review =
                    await prisma.review
                        .findUnique({
                            where: {
                                id: reviewId,
                            },
                        });


                expect(
                    review.content
                ).toBe(
                    "Güncellenmiş yorum."
                );
            }
        );


        test(
            "PUT /reviews/:id - kullanıcı başka kullanıcının yorumunu güncelleyememeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/reviews")
                        .set(
                            "Authorization",
                            `Bearer ${userTwoToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            content:
                                "User Two yorumu.",
                        });


                const reviewId =
                    createResponse.body.data.id;


                const updateResponse =
                    await request(app)
                        .put(
                            `/reviews/${reviewId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            content:
                                "Yetkisiz değişiklik.",
                        });


                expect(
                    updateResponse.statusCode
                ).toBe(403);

                expect(
                    updateResponse.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Bu yorumu güncelleme yetkiniz yok.",
                });


                // DB kaydı değişmemiş olmalıdır
                const review =
                    await prisma.review
                        .findUnique({
                            where: {
                                id: reviewId,
                            },
                        });


                expect(
                    review.content
                ).toBe(
                    "User Two yorumu."
                );
            }
        );


        test(
            "DELETE /reviews/:id - kullanıcı kendi yorumunu gerçek DB'den silebilmeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/reviews")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            content:
                                "Silinecek yorum.",
                        });


                const reviewId =
                    createResponse.body.data.id;


                const deleteResponse =
                    await request(app)
                        .delete(
                            `/reviews/${reviewId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        );


                expect(
                    deleteResponse.statusCode
                ).toBe(200);

                expect(
                    deleteResponse.body
                ).toEqual({
                    success: true,
                    message:
                        "Yorum silindi.",
                    data: null,
                });


                const review =
                    await prisma.review
                        .findUnique({
                            where: {
                                id: reviewId,
                            },
                        });


                expect(review).toBeNull();
            }
        );


        test(
            "DELETE /reviews/:id - kullanıcı başka kullanıcının yorumunu silememeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/reviews")
                        .set(
                            "Authorization",
                            `Bearer ${userTwoToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            content:
                                "Korunan yorum.",
                        });


                const reviewId =
                    createResponse.body.data.id;


                const deleteResponse =
                    await request(app)
                        .delete(
                            `/reviews/${reviewId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
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
                        "Bu yorumu silme yetkiniz yok.",
                });


                const review =
                    await prisma.review
                        .findUnique({
                            where: {
                                id: reviewId,
                            },
                        });


                expect(review)
                    .not.toBeNull();
            }
        );


        /*
         * Rating Integration
         */


        test(
            "POST /ratings - puanı gerçek DB'ye kaydetmeli",
            async () => {
                const response =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 9,
                        });


                expect(
                    response.statusCode
                ).toBe(201);

                expect(
                    response.body.success
                ).toBe(true);


                const rating =
                    await prisma.rating
                        .findUnique({
                            where: {
                                userId_tmdbMovieId: {
                                    userId:
                                        userOne.id,
                                    tmdbMovieId:
                                        MOVIE_ID,
                                },
                            },
                        });


                expect(rating)
                    .not.toBeNull();

                expect(
                    rating.rating
                ).toBe(9);
            }
        );


        test(
            "POST /ratings - aynı kullanıcı aynı filme ikinci kez puan verememeli",
            async () => {
                const firstResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 8,
                        });


                expect(
                    firstResponse.statusCode
                ).toBe(201);


                const secondResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 10,
                        });


                expect(
                    secondResponse.statusCode
                ).toBe(400);

                expect(
                    secondResponse.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Bu filme zaten puan verdiniz.",
                });


                const count =
                    await prisma.rating.count({
                        where: {
                            userId:
                                userOne.id,
                            tmdbMovieId:
                                MOVIE_ID,
                        },
                    });


                expect(count).toBe(1);
            }
        );


        test(
            "GET /ratings/movie/:tmdbMovieId - gerçek DB ortalamasını ve toplam puanı doğru hesaplamalı",
            async () => {
                await request(app)
                    .post("/ratings")
                    .set(
                        "Authorization",
                        `Bearer ${userOneToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                        rating: 8,
                    });


                await request(app)
                    .post("/ratings")
                    .set(
                        "Authorization",
                        `Bearer ${userTwoToken}`
                    )
                    .send({
                        tmdbMovieId:
                            MOVIE_ID,
                        rating: 10,
                    });


                const response =
                    await request(app)
                        .get(
                            `/ratings/movie/${MOVIE_ID}`
                        );


                expect(
                    response.statusCode
                ).toBe(200);

                expect(
                    response.body.success
                ).toBe(true);

                expect(
                    response.body.data.ratings
                ).toHaveLength(2);

                expect(
                    response.body.data
                        .averageRatings
                ).toBe(9);

                expect(
                    response.body.data
                        .totalRatings
                ).toBe(2);
            }
        );


        test(
            "PUT /ratings/:id - kullanıcı kendi puanını gerçek DB'de güncelleyebilmeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 7,
                        });


                const ratingId =
                    createResponse.body.data.id;


                const updateResponse =
                    await request(app)
                        .put(
                            `/ratings/${ratingId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            rating: 9,
                        });


                expect(
                    updateResponse.statusCode
                ).toBe(200);


                const rating =
                    await prisma.rating
                        .findUnique({
                            where: {
                                id: ratingId,
                            },
                        });


                expect(
                    rating.rating
                ).toBe(9);
            }
        );


        test(
            "PUT /ratings/:id - kullanıcı başka kullanıcının puanını güncelleyememeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userTwoToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 8,
                        });


                const ratingId =
                    createResponse.body.data.id;


                const updateResponse =
                    await request(app)
                        .put(
                            `/ratings/${ratingId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            rating: 10,
                        });


                expect(
                    updateResponse.statusCode
                ).toBe(403);

                expect(
                    updateResponse.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Bu puanı güncelleme yetkiniz yok.",
                });


                const rating =
                    await prisma.rating
                        .findUnique({
                            where: {
                                id: ratingId,
                            },
                        });


                expect(
                    rating.rating
                ).toBe(8);
            }
        );


        test(
            "DELETE /ratings/:id - kullanıcı kendi puanını gerçek DB'den silebilmeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 9,
                        });


                const ratingId =
                    createResponse.body.data.id;


                const deleteResponse =
                    await request(app)
                        .delete(
                            `/ratings/${ratingId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
                        );


                expect(
                    deleteResponse.statusCode
                ).toBe(200);

                expect(
                    deleteResponse.body
                ).toEqual({
                    success: true,
                    message:
                        "Film puanı silindi.",
                    data: null,
                });


                const rating =
                    await prisma.rating
                        .findUnique({
                            where: {
                                id: ratingId,
                            },
                        });


                expect(rating).toBeNull();
            }
        );


        test(
            "DELETE /ratings/:id - kullanıcı başka kullanıcının puanını silememeli",
            async () => {
                const createResponse =
                    await request(app)
                        .post("/ratings")
                        .set(
                            "Authorization",
                            `Bearer ${userTwoToken}`
                        )
                        .send({
                            tmdbMovieId:
                                MOVIE_ID,
                            rating: 10,
                        });


                const ratingId =
                    createResponse.body.data.id;


                const deleteResponse =
                    await request(app)
                        .delete(
                            `/ratings/${ratingId}`
                        )
                        .set(
                            "Authorization",
                            `Bearer ${userOneToken}`
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
                        "Bu puanı silme yetkiniz yok.",
                });


                const rating =
                    await prisma.rating
                        .findUnique({
                            where: {
                                id: ratingId,
                            },
                        });


                expect(rating)
                    .not.toBeNull();
            }
        );
    }
);