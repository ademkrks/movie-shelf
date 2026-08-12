// Uygulama genelinde kullanılacak özel hata sınıfı
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        // HTTP durum kodu
        this.statusCode = statusCode;

        // Hata tipi
        this.status = String(statusCode).startsWith("4")
            ? "fail"
            : "error";

        // Operasyonel hata olduğunu belirtir
        this.isOperational = true;

        // Stack trace oluşturur
        Error.captureStackTrace(this, this.constructor);
    }
}

// Dışa aktarır
module.exports = AppError;