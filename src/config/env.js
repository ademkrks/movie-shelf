const requiredEnvVariables = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "TMDB_API_KEY",
];

const missingVariables = requiredEnvVariables.filter(
    (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Eksik environment variable: ${missingVariables.join(", ")}`
    );
}

const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT geçerli bir değer olmalıdır.");
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || "development",
    port,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    tmdbApiKey: process.env.TMDB_API_KEY,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};