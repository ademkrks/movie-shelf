// Sunucuya gelen istekleri terminale yazdırır
const logger = (req, res, next) => {
    // Test ortamında gereksiz terminal çıktısı oluşturmaz
    if (process.env.NODE_ENV !== "test") {
        console.log(
            `${req.method} ${req.originalUrl}`
        );
    }

    // Sonraki middleware'e geçer
    next();
};


// Fonksiyonu dışa aktarır
module.exports = logger;