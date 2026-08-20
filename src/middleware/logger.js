// Sunucuya gelen istekleri terminale yazdırır
const logger = (req, res, next) => {
    // Test ortamında gereksiz terminal çıktısı oluşturmaz
    if (
        process.env.NODE_ENV !==
        "test"
    ) {
        /*
         * Query string loglanmaz.
         *
         * Böylece gelecekte URL üzerinde
         * hassas query parametreleri kullanılırsa
         * log dosyalarına taşınmaları engellenir.
         */
        console.log(
            `${req.method} ${req.path}`
        );
    }

    // Sonraki middleware'e geçer
    next();
};


// Fonksiyonu dışa aktarır
module.exports = logger;