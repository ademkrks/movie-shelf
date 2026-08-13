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
    "integration-user@movieshelf.test";

const TEST_PASSWORD =
    "GucluSifre123";


// Integration test kullanıcısını temizler
const deleteTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            email: TEST_EMAIL,
        },
    });
};


describe("Auth Integration", () => {
    beforeAll(async () => {
        await deleteTestUser();
    });


    afterAll(async () => {
        await deleteTestUser();

        await prisma.$disconnect();
    });


    test(
        "POST /auth/register - kullanıcı gerçek PostgreSQL veritabanına kaydedilmeli",
        async () => {
            const response = await request(app)
                .post("/auth/register")
                .send({
                    name: "Integration User",
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(201);

            expect(response.body.success).toBe(
                true
            );

            expect(
                response.body.data.email
            ).toBe(TEST_EMAIL);

            // Kullanıcının gerçekten DB'ye yazıldığını kontrol eder
            const user =
                await prisma.user.findUnique({
                    where: {
                        email: TEST_EMAIL,
                    },
                });

            expect(user).not.toBeNull();

            expect(user.name).toBe(
                "Integration User"
            );

            expect(user.role).toBe("USER");

            expect(
                user.tokenVersion
            ).toBe(0);

            // Parola düz metin olarak saklanmamalıdır
            expect(user.password).not.toBe(
                TEST_PASSWORD
            );

            // DB'deki bcrypt hash doğru şifreye ait olmalıdır
            expect(
                await bcrypt.compare(
                    TEST_PASSWORD,
                    user.password
                )
            ).toBe(true);
        }
    );


    test(
        "POST /auth/login - gerçek DB kullanıcısıyla giriş yapmalı",
        async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                });

            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(
                true
            );

            expect(
                typeof response.body.data.token
            ).toBe("string");

            expect(
                response.body.data.user.email
            ).toBe(TEST_EMAIL);

            expect(
                response.body.data.user.password
            ).toBeUndefined();
        }
    );


    test(
        "GET /users/me - login tokenı gerçek auth middleware ile çalışmalı",
        async () => {
            const loginResponse =
                await request(app)
                    .post("/auth/login")
                    .send({
                        email: TEST_EMAIL,
                        password: TEST_PASSWORD,
                    });

            expect(
                loginResponse.statusCode
            ).toBe(200);

            const token =
                loginResponse.body.data.token;

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

            expect(
                profileResponse.body.success
            ).toBe(true);

            expect(
                profileResponse.body.data.email
            ).toBe(TEST_EMAIL);

            expect(
                profileResponse.body.data.name
            ).toBe(
                "Integration User"
            );
        }
    );
});