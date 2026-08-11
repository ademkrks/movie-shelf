// Global Hata Yakalama Middleware'i
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Production ortamında gerçek hata detaylarını istemciye gönderme
    const isProduction = process.env.NODE_ENV === "production";

    const message = isProduction
        ? "Beklenmeyen bir hata oluştu."
        : err.message || "Sunucu hatası oluştu.";

    // Gerçek hatayı server tarafında logla
    console.error("ERROR:", {
        message: err.message,
        statusCode,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
    });

    res.status(statusCode).json({
        success: false,
        status: err.status || "error",
        message,
    });
};

module.exports = errorHandler;