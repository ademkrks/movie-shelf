const path = require("path");
const { spawnSync } = require(
    "child_process"
);
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
    console.error(
        ".env.test dosyası bulunamadı."
    );

    process.exit(1);
}


// Test ortamını belirler
process.env.NODE_ENV = "test";


// Test DB güvenlik kontrolü
const databaseUrl =
    process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error(
        "DATABASE_URL tanımlı değil."
    );

    process.exit(1);
}


let databaseName;

try {
    const parsedUrl =
        new URL(databaseUrl);

    databaseName = parsedUrl.pathname
        .replace(/^\/+/, "")
        .split("?")[0];
} catch (error) {
    console.error(
        "DATABASE_URL geçerli değil."
    );

    process.exit(1);
}


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
    console.error(
        `Güvenlik kontrolü başarısız: "${databaseName}" test veritabanı olarak kullanılamaz.`
    );

    process.exit(1);
}


console.log(
    `Integration test database: ${databaseName}`
);


// Komutu işletim sistemine uygun şekilde çalıştırır
const runCommand = (
    command,
    args
) => {
    let commandResult;

    /*
     * Windows'ta .cmd dosyaları doğrudan
     * çalıştırılamadığı için cmd.exe kullanılır.
     */
    if (process.platform === "win32") {
        commandResult = spawnSync(
            "cmd.exe",
            [
                "/d",
                "/s",
                "/c",
                command,
                ...args,
            ],
            {
                stdio: "inherit",
                env: process.env,
            }
        );
    } else {
        commandResult = spawnSync(
            command,
            args,
            {
                stdio: "inherit",
                env: process.env,
            }
        );
    }

    // Process başlatılamadıysa gerçek hatayı gösterir
    if (commandResult.error) {
        console.error(
            "\nKomut başlatılamadı:",
            commandResult.error.message
        );
    }

    // Signal nedeniyle kapandıysa gösterir
    if (commandResult.signal) {
        console.error(
            `\nKomut "${commandResult.signal}" sinyali ile sonlandı.`
        );
    }

    return commandResult;
};


// Migration'ları yalnızca test DB'ye uygular
console.log(
    "\nTest database migration kontrolü..."
);

const migrationResult = runCommand(
    "npx",
    [
        "prisma",
        "migrate",
        "deploy",
    ]
);


if (migrationResult.status !== 0) {
    console.error(
        "\nTest database migration başarısız."
    );

    console.error(
        `Exit code: ${migrationResult.status}`
    );

    process.exit(
        migrationResult.status || 1
    );
}


// Integration testlerini çalıştırır
console.log(
    "\nIntegration testleri başlatılıyor...\n"
);

const testResult = runCommand(
    "npx",
    [
        "jest",
        "--config",
        "jest.integration.config.js",
        "--runInBand",
    ]
);


if (testResult.status !== 0) {
    console.error(
        "\nIntegration testleri başarısız."
    );

    console.error(
        `Exit code: ${testResult.status}`
    );

    process.exit(
        testResult.status || 1
    );
}


console.log(
    "\nIntegration testleri başarıyla tamamlandı."
);

process.exit(0);