const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");


// Integration test environment dosyasının yolunu belirler
const envPath = path.resolve(
    process.cwd(),
    ".env.test"
);


// Lokal ortamda .env.test varsa yükler
if (fs.existsSync(envPath)) {
    const result = dotenv.config({
        path: envPath,
        override: true,
    });

    if (result.error) {
        throw new Error(
            ".env.test dosyası yüklenemedi."
        );
    }
}


/*
 * CI ortamında .env.test bulunmaz.
 * Bu durumda GitHub Actions tarafından sağlanan
 * process.env değerleri kullanılır.
 */
process.env.NODE_ENV = "test";


// Testlerin yanlışlıkla development veya production
// veritabanında çalışmasını engeller
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


// Veritabanı adı boş olamaz
if (!databaseName) {
    throw new Error(
        "Integration test DATABASE_URL içinde veritabanı adı bulunamadı."
    );
}


// Yalnızca *_test veya *-test isimli DB'lere izin verir
const normalizedDatabaseName =
    databaseName.toLowerCase();

const isTestDatabase =
    normalizedDatabaseName.endsWith(
        "_test"
    ) ||
    normalizedDatabaseName.endsWith(
        "-test"
    );


if (!isTestDatabase) {
    throw new Error(
        `Güvenlik nedeniyle integration testleri "${databaseName}" veritabanında çalıştırılamaz. Test DB adı "_test" veya "-test" ile bitmelidir.`
    );
}