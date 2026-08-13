const path = require("path");
const dotenv = require("dotenv");


// Integration test environment dosyasını yükler
const envPath = path.resolve(
    process.cwd(),
    ".env.test"
);

const result = dotenv.config({
    path: envPath,
    override: true,
});


if (result.error) {
    throw new Error(
        ".env.test dosyası bulunamadı. Integration testleri çalıştırılamaz."
    );
}


// Test ortamını belirler
process.env.NODE_ENV = "test";


// Testlerin yanlışlıkla development DB üzerinde çalışmasını engeller
const databaseUrl =
    process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "Integration test DATABASE_URL tanımlı değil."
    );
}


let databaseName;

try {
    const parsedUrl =
        new URL(databaseUrl);

    databaseName = parsedUrl.pathname
        .replace(/^\/+/, "")
        .split("?")[0];
} catch (error) {
    throw new Error(
        "Integration test DATABASE_URL geçerli değil."
    );
}


// Yalnızca *_test veya *-test isimli DB'lere izin verir
const isTestDatabase =
    databaseName
        .toLowerCase()
        .endsWith("_test") ||
    databaseName
        .toLowerCase()
        .endsWith("-test");


if (!isTestDatabase) {
    throw new Error(
        `Güvenlik nedeniyle integration testleri "${databaseName}" veritabanında çalıştırılamaz. Test DB adı "_test" veya "-test" ile bitmelidir.`
    );
}