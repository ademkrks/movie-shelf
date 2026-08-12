// Global hata yakalama middleware'i
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;

    let status =
        err.status ||
        (String(statusCode).startsWith("4")
            ? "fail"
            : "error");

    // Varsayılan güvenli hata mesajı
    let message = err.isOperational
        ? err.message
        : "Beklenmeyen bir hata oluştu.";


    // Prisma unique constraint hatası
    if (err.code === "P2002") {
        statusCode = 409;
        status = "fail";
        message = "Bu bilgi zaten kullanımda.";
    }


    // Prisma kayıt bulunamadı hatası
    if (err.code === "P2025") {
        statusCode = 404;
        status = "fail";
        message = "Kayıt bulunamadı.";
    }


    // Gerçek hata detayları yalnızca sunucu tarafında loglanır
    console.error("ERROR:", {
        message: err.message,
        code: err.code,
        statusCode,
        status,
        method: req.method,
        url: req.originalUrl,
        stack: err.stack,
    });


    // Güvenli API hata cevabı
    return res.status(statusCode).json({
        success: false,
        status,
        message,
    });
};


module.exports = errorHandler;