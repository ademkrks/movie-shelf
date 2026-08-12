// Sunucuya gelen istekleri terminale yazdırır
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);

    // Sonraki middleware'e geçer
    next();
};

// Fonksiyonu dışa aktarır
module.exports = logger;