const env = require("./config/env");

const app = require("./app");

const prisma = require("./config/prisma");


// HTTP sunucusunu başlatır
const server = app.listen(
    env.port,
    () => {
        console.log(
            `MovieShelf API ${env.nodeEnv} ortamında ${env.port} portunda çalışıyor.`
        );
    }
);


// Sunucuyu kontrollü şekilde kapatır
const shutdown = (signal) => {
    console.log(
        `${signal} sinyali alındı. Sunucu kapatılıyor...`
    );

    server.close(async () => {
        try {
            await prisma.$disconnect();

            console.log(
                "Veritabanı bağlantısı kapatıldı."
            );

            process.exit(0);
        } catch (error) {
            console.error(
                "Sunucu kapatılırken hata oluştu:",
                error
            );

            process.exit(1);
        }
    });
};


// Deployment platformlarından gelen kapatma sinyalleri
process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);