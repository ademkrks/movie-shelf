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


// Liste API cevabı
const list = (
    res,
    data,
    message = "Liste başarıyla getirildi.",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        count: data.length,
        data,
    });
};


module.exports = {
    success,
    list,
};