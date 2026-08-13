module.exports = {
    testEnvironment: "node",

    // Sadece integration testlerini çalıştırır
    testMatch: [
        "**/tests/integration/**/*.integration.test.js",
    ],

    // Integration test environment değişkenlerini yükler
    setupFiles: [
        "<rootDir>/tests/integration/setupIntegrationEnv.js",
    ],

    clearMocks: true,

    // Gerçek DB işlemleri için daha geniş süre
    testTimeout: 15000,
};