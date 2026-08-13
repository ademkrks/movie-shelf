const swaggerJsdoc = require(
    "swagger-jsdoc"
);

const env = require("./env");


const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "MovieShelf API",
            version: "1.0.0",
            description:
                "MovieShelf film yönetim ve kullanıcı API'si",
        },

        servers: [
            {
                url: env.apiBaseUrl,
                description:
                    env.isProduction
                        ? "Production Server"
                        : "Development Server",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },

    apis: [
        "./src/routes/*.js",
        "./src/controllers/*.js",
    ],
};


const swaggerSpec =
    swaggerJsdoc(options);


module.exports = swaggerSpec;