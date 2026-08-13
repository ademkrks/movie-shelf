const request = require("supertest");
const bcrypt = require("bcrypt");

const prisma = require(
    "../../src/config/prisma"
);

const app = require(
    "../../src/app"
);


// Integration test kullanıcısı
const TEST_EMAIL =
    "security-user@movieshelf.test";

const CURRENT_PASSWORD =
    "MevcutSifre123";

const NEW_PASSWORD =
    "YeniGucluSifre456";


// Test kullanıcısını temizler
const deleteTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            email: TEST_EMAIL,
        },
    });
};


// Test kullanıcısını gerçek API üzerinden oluşturur
const createTestUser = async () => {
    const response = await request(app)
        .post("/auth/register")
        .send({
            name: "Security Test User",
            email: TEST_EMAIL,
            password: CURRENT_PASSWORD,
        });

    expect(response.statusCode).toBe(201);
};


// Kullanıcıyı gerçek API üzerinden login eder
const login = async (password) => {
    return await request(app)
        .post("/auth/login")
        .send({
            email: TEST_EMAIL,
            password,
        });
};


describe(
    "User Security Integration",
    () => {
        beforeAll(async () => {
            await deleteTestUser();

            await createTestUser();
        });


        afterAll(async () => {
            await deleteTestUser();

            await prisma.$disconnect();
        });


        test(
            "PUT /users/change-password - yanlış mevcut şifre kullanıcının şifresini veya JWT'sini değiştirmemeli",
            async () => {
                // Kullanıcı mevcut şifresiyle giriş yapar
                const loginResponse =
                    await login(
                        CURRENT_PASSWORD
                    );

                expect(
                    loginResponse.statusCode
                ).toBe(200);

                const token =
                    loginResponse.body
                        .data.token;


                // Yanlış mevcut şifreyle değişiklik denenir
                const changeResponse =
                    await request(app)
                        .put(
                            "/users/change-password"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        )
                        .send({
                            currentPassword:
                                "YanlisSifre123",
                            newPassword:
                                NEW_PASSWORD,
                        });

                expect(
                    changeResponse.statusCode
                ).toBe(401);

                expect(
                    changeResponse.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Mevcut şifre hatalı.",
                });


                /*
                 * Başarısız şifre değiştirme
                 * JWT'yi iptal etmemelidir.
                 */
                const profileResponse =
                    await request(app)
                        .get("/users/me")
                        .set(
                            "Authorization",
                            `Bearer ${token}`
                        );

                expect(
                    profileResponse.statusCode
                ).toBe(200);


                // Eski şifre hâlâ çalışmalıdır
                const secondLoginResponse =
                    await login(
                        CURRENT_PASSWORD
                    );

                expect(
                    secondLoginResponse
                        .statusCode
                ).toBe(200);


                // tokenVersion değişmemiş olmalıdır
                const user =
                    await prisma.user
                        .findUnique({
                            where: {
                                email:
                                    TEST_EMAIL,
                            },
                        });

                expect(user).not.toBeNull();

                expect(
                    user.tokenVersion
                ).toBe(0);

                expect(
                    await bcrypt.compare(
                        CURRENT_PASSWORD,
                        user.password
                    )
                ).toBe(true);
            }
        );


        test(
            "PUT /users/change-password - şifreyi gerçek DB'de değiştirmeli, eski JWT'yi iptal etmeli ve reset tokenlarını temizlemeli",
            async () => {
                /*
                 * Password change öncesindeki
                 * geçerli JWT alınır.
                 */
                const loginResponse =
                    await login(
                        CURRENT_PASSWORD
                    );

                expect(
                    loginResponse.statusCode
                ).toBe(200);

                const oldToken =
                    loginResponse.body
                        .data.token;


                // Kullanıcı DB'den bulunur
                const userBeforeChange =
                    await prisma.user
                        .findUnique({
                            where: {
                                email:
                                    TEST_EMAIL,
                            },
                        });

                expect(
                    userBeforeChange
                ).not.toBeNull();

                expect(
                    userBeforeChange
                        .tokenVersion
                ).toBe(0);


                /*
                 * Şifre değiştiğinde açık reset
                 * tokenlarının da temizlendiğini
                 * doğrulamak için gerçek kayıt oluşturur.
                 */
                await prisma
                    .passwordResetToken
                    .create({
                        data: {
                            userId:
                                userBeforeChange.id,
                            tokenHash:
                                "f".repeat(64),
                            expiresAt:
                                new Date(
                                    Date.now() +
                                    15 *
                                    60 *
                                    1000
                                ),
                        },
                    });


                const resetTokenCountBefore =
                    await prisma
                        .passwordResetToken
                        .count({
                            where: {
                                userId:
                                    userBeforeChange.id,
                            },
                        });

                expect(
                    resetTokenCountBefore
                ).toBe(1);


                // Şifre gerçek endpoint üzerinden değiştirilir
                const changeResponse =
                    await request(app)
                        .put(
                            "/users/change-password"
                        )
                        .set(
                            "Authorization",
                            `Bearer ${oldToken}`
                        )
                        .send({
                            currentPassword:
                                CURRENT_PASSWORD,
                            newPassword:
                                NEW_PASSWORD,
                        });

                expect(
                    changeResponse.statusCode
                ).toBe(200);

                expect(
                    changeResponse.body
                ).toEqual({
                    success: true,
                    message:
                        "Şifre başarıyla değiştirildi. Lütfen tekrar giriş yapın.",
                    data: null,
                });


                // Gerçek DB kaydı tekrar kontrol edilir
                const userAfterChange =
                    await prisma.user
                        .findUnique({
                            where: {
                                email:
                                    TEST_EMAIL,
                            },
                        });

                expect(
                    userAfterChange
                ).not.toBeNull();


                // tokenVersion gerçekten artmış olmalıdır
                expect(
                    userAfterChange
                        .tokenVersion
                ).toBe(1);


                // Yeni parola düz metin saklanmamalıdır
                expect(
                    userAfterChange.password
                ).not.toBe(
                    NEW_PASSWORD
                );


                // Yeni hash yeni şifreye ait olmalıdır
                expect(
                    await bcrypt.compare(
                        NEW_PASSWORD,
                        userAfterChange
                            .password
                    )
                ).toBe(true);


                // Eski şifre artık hash ile eşleşmemelidir
                expect(
                    await bcrypt.compare(
                        CURRENT_PASSWORD,
                        userAfterChange
                            .password
                    )
                ).toBe(false);


                /*
                 * Password change sonrası açık
                 * password reset tokenları silinmelidir.
                 */
                const resetTokenCountAfter =
                    await prisma
                        .passwordResetToken
                        .count({
                            where: {
                                userId:
                                    userAfterChange.id,
                            },
                        });

                expect(
                    resetTokenCountAfter
                ).toBe(0);


                /*
                 * Password change öncesinde alınan
                 * JWT artık çalışmamalıdır.
                 */
                const oldTokenResponse =
                    await request(app)
                        .get("/users/me")
                        .set(
                            "Authorization",
                            `Bearer ${oldToken}`
                        );

                expect(
                    oldTokenResponse
                        .statusCode
                ).toBe(401);

                expect(
                    oldTokenResponse.body
                ).toEqual({
                    success: false,
                    status: "fail",
                    message:
                        "Geçersiz veya süresi dolmuş token.",
                });


                // Eski şifreyle login artık başarısız olmalıdır
                const oldPasswordLogin =
                    await login(
                        CURRENT_PASSWORD
                    );

                expect(
                    oldPasswordLogin
                        .statusCode
                ).toBe(401);

                expect(
                    oldPasswordLogin.body
                        .message
                ).toBe(
                    "E-posta veya şifre hatalı."
                );


                // Yeni şifreyle giriş başarılı olmalıdır
                const newPasswordLogin =
                    await login(
                        NEW_PASSWORD
                    );

                expect(
                    newPasswordLogin
                        .statusCode
                ).toBe(200);

                expect(
                    newPasswordLogin.body
                        .success
                ).toBe(true);

                const newToken =
                    newPasswordLogin.body
                        .data.token;


                /*
                 * Yeni login sonrası alınan JWT
                 * güncel tokenVersion taşıdığı için
                 * protected endpointte çalışmalıdır.
                 */
                const newTokenResponse =
                    await request(app)
                        .get("/users/me")
                        .set(
                            "Authorization",
                            `Bearer ${newToken}`
                        );

                expect(
                    newTokenResponse
                        .statusCode
                ).toBe(200);

                expect(
                    newTokenResponse.body
                        .data.email
                ).toBe(TEST_EMAIL);
            }
        );
    }
);