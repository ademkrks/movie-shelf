// Başarılı işlem cevabı
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

// Liste cevabı
const list = (
    res,
    data,
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        count: data.length,
        data,
    });
};

module.exports = {
    success,
    list,
};