const request = require("supertest");
const jwt = require("jsonwebtoken");


// Auth middleware'in gerçek DB'ye bağlanmasını engeller
jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
    },
}));


const prisma = require("../src/config/prisma");
const app = require("../src/app");


// Test kullanıcısı için geçerli JWT oluşturur
const createAuthToken = () => {
    return jwt.sign(
        {
            id: 1,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};


describe("User API", () => {
    let authToken;


    beforeEach(() => {
        // Auth middleware'in bulacağı sahte kullanıcı
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            name: "Test User",
            email: "test@example.com",
            createdAt: new Date(),
        });

        authToken = createAuthToken();
    });


    test(
        "PUT /users/me - token olmadan 401 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .send({
                    name: "Yeni İsim",
                });

            expect(response.statusCode).toBe(401);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Yetkilendirme başarısız.",
            });
        }
    );


    test(
        "PUT /users/me - boş body için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body).toMatchObject({
                success: false,
                status: "fail",
                message: "Geçersiz istek.",
            });

            expect(response.body.errors).toContain(
                "Güncellenecek en az bir alan gönderilmelidir."
            );
        }
    );


    test(
        "PUT /users/me - name metin değilse 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    name: 123,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Ad alanı metin olmalıdır."
            );
        }
    );


    test(
        "PUT /users/me - boş name için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    name: "   ",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Ad alanı boş bırakılamaz."
            );
        }
    );


    test(
        "PUT /users/me - 100 karakter üzeri name için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    name: "a".repeat(101),
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Ad alanı en fazla 100 karakter olabilir."
            );
        }
    );


    test(
        "PUT /users/me - email metin değilse 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: 123,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "E-posta alanı metin olmalıdır."
            );
        }
    );


    test(
        "PUT /users/me - boş email için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: "   ",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "E-posta alanı boş bırakılamaz."
            );
        }
    );


    test(
        "PUT /users/me - geçersiz email için 400 dönmeli",
        async () => {
            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: "gecersiz-email",
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "Geçerli bir e-posta adresi giriniz."
            );
        }
    );


    test(
        "PUT /users/me - 255 karakter üzeri email için 400 dönmeli",
        async () => {
            const longEmail =
                `${"a".repeat(245)}@example.com`;

            const response = await request(app)
                .put("/users/me")
                .set(
                    "Authorization",
                    `Bearer ${authToken}`
                )
                .send({
                    email: longEmail,
                });

            expect(response.statusCode).toBe(400);

            expect(response.body.errors).toContain(
                "E-posta alanı en fazla 255 karakter olabilir."
            );
        }
    );
});