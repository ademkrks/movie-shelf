module.exports = {
    testEnvironment: "node",

    // Normal unit / API testlerini çalıştırır
    testMatch: [
        "**/tests/**/*.test.js",
    ],

    /*
     * Integration testleri ayrı config ve
     * gerçek PostgreSQL test DB ile çalışır.
     *
     * npm test sırasında integration
     * testlerinin çalışmasını engeller.
     */
    testPathIgnorePatterns: [
        "<rootDir>/tests/integration/",
    ],

    // Unit / mock test ortamını hazırlar
    setupFiles: [
        "<rootDir>/tests/setupEnv.js",
    ],

    clearMocks: true,
};