require("dotenv").config();


// Desteklenen çalışma ortamları
const allowedNodeEnvs = [
    "development",
    "test",
    "production",
];


// Çalışma ortamını belirler
const nodeEnv =
    process.env.NODE_ENV ||
    "development";


// NODE_ENV kontrolü
if (!allowedNodeEnvs.includes(nodeEnv)) {
    throw new Error(
        "NODE_ENV development, test veya production olmalıdır."
    );
}


// Her ortamda zorunlu environment variable'lar
const requiredEnvVariables = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "TMDB_API_KEY",
    "TMDB_BASE_URL",
    "FRONTEND_URL",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
];


// Production ortamında ayrıca zorunlu olan değişkenler
const productionRequiredEnvVariables = [
    "CORS_ORIGIN",
    "API_BASE_URL",
];


// Kontrol edilecek environment variable listesini oluşturur
const envVariablesToCheck = [
    ...requiredEnvVariables,
    ...(nodeEnv === "production"
        ? productionRequiredEnvVariables
        : []),
];


// Eksik environment variable'ları kontrol eder
const missingVariables =
    envVariablesToCheck.filter(
        (variable) =>
            !process.env[variable] ||
            process.env[variable].trim() === ""
    );


// Eksik variable varsa uygulamanın başlamasını engeller
if (missingVariables.length > 0) {
    throw new Error(
        `Eksik environment variable: ${missingVariables.join(", ")}`
    );
}


// Uygulama portunu kontrol eder
const port = Number(
    process.env.PORT || 5000
);

if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
) {
    throw new Error(
        "PORT geçerli bir değer olmalıdır."
    );
}


// E-posta portunu kontrol eder
const emailPort = Number(
    process.env.EMAIL_PORT || 587
);

if (
    !Number.isInteger(emailPort) ||
    emailPort <= 0 ||
    emailPort > 65535
) {
    throw new Error(
        "EMAIL_PORT geçerli bir değer olmalıdır."
    );
}


// Boolean environment variable değerini doğrular
const parseBoolean = (
    value,
    variableName,
    defaultValue = false
) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return defaultValue;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    throw new Error(
        `${variableName} true veya false olmalıdır.`
    );
};


// URL değerini doğrular
const validateUrl = (
    value,
    variableName
) => {
    try {
        return new URL(value).toString();
    } catch (error) {
        throw new Error(
            `${variableName} geçerli bir URL olmalıdır.`
        );
    }
};


// PostgreSQL bağlantı adresini doğrular
const validateDatabaseUrl = (value) => {
    let databaseUrl;

    try {
        databaseUrl = new URL(value);
    } catch (error) {
        throw new Error(
            "DATABASE_URL geçerli bir PostgreSQL bağlantı adresi olmalıdır."
        );
    }

    if (
        databaseUrl.protocol !== "postgresql:" &&
        databaseUrl.protocol !== "postgres:"
    ) {
        throw new Error(
            "DATABASE_URL PostgreSQL bağlantısı olmalıdır."
        );
    }

    return value;
};


// CORS origin listesini hazırlar
const corsOrigins = (
    process.env.CORS_ORIGIN ||
    "http://localhost:3000"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);


// CORS adreslerini doğrular
corsOrigins.forEach((origin) => {
    validateUrl(
        origin,
        "CORS_ORIGIN"
    );
});


// Production ortamında zayıf JWT secret kullanımını engeller
if (
    nodeEnv === "production" &&
    process.env.JWT_SECRET.length < 32
) {
    throw new Error(
        "Production ortamında JWT_SECRET en az 32 karakter olmalıdır."
    );
}


// Kritik URL ayarlarını doğrular
const databaseUrl =
    validateDatabaseUrl(
        process.env.DATABASE_URL
    );

const tmdbBaseUrl =
    validateUrl(
        process.env.TMDB_BASE_URL,
        "TMDB_BASE_URL"
    );

const frontendUrl =
    validateUrl(
        process.env.FRONTEND_URL,
        "FRONTEND_URL"
    );

const apiBaseUrl =
    process.env.API_BASE_URL
        ? validateUrl(
            process.env.API_BASE_URL,
            "API_BASE_URL"
        )
        : `http://localhost:${port}`;


// Environment ayarlarını dışa aktarır
module.exports = {
    nodeEnv,

    isDevelopment:
        nodeEnv === "development",

    isTest:
        nodeEnv === "test",

    isProduction:
        nodeEnv === "production",

    port,

    databaseUrl,

    jwtSecret:
        process.env.JWT_SECRET,

    jwtExpiresIn:
        process.env.JWT_EXPIRES_IN,

    tmdbApiKey:
        process.env.TMDB_API_KEY,

    tmdbBaseUrl,

    corsOrigins,

    frontendUrl,

    apiBaseUrl,

    emailHost:
        process.env.EMAIL_HOST,

    emailPort,

    emailSecure:
        parseBoolean(
            process.env.EMAIL_SECURE,
            "EMAIL_SECURE"
        ),

    emailUser:
        process.env.EMAIL_USER,

    emailPass:
        process.env.EMAIL_PASS,

    emailFrom:
        process.env.EMAIL_FROM,
};