// Özel hata sınıfını içe aktarır
const AppError = require("../utils/AppError");

// Bulunamayan endpoint'leri yakalar
const notFound = (req, res, next) => {
    next(
        new AppError(
            `Endpoint bulunamadı: ${req.originalUrl}`,
            404
        )
    );
};

module.exports = notFound;