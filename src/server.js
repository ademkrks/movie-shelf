// Ortam değişkenlerini yükler
require("dotenv").config();

// Environment variable kontrolünü çalıştırır
const env = require("./config/env");

// app.js dosyasındaki Express uygulamasını içe aktarır
const app = require("./app");

// Sunucuyu başlatır
app.listen(env.port, () => {
    console.log(
        `Server http://localhost:${env.port} adresinde çalışıyor`
    );
});