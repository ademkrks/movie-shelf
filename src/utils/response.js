// Başarılı API cevabı
const success = (
    res,
    data,
    message = "İşlem başarılı",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

module.exports = {
    success,
};