const request = require("supertest");

const app = require("../src/app");


describe("Health Check API", () => {
    test(
        "GET /health - API çalışıyorsa 200 dönmeli",
        async () => {
            const response =
                await request(app)
                    .get("/health");


            expect(
                response.statusCode
            ).toBe(200);

            expect(
                response.body
            ).toEqual({
                success: true,
                status: "ok",
            });
        }
    );
});