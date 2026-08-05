//Özel Hata Sınıfını İçe Aktarır
const AppError =require("../utils/AppError");

//Bulunamayan Endpoint'leri Yakalar
const notFound =(req,res,next)=>{
    next(
        new AppError(
            `Endpoint Bulunamadı : ${req.originalUrl}`,
            404
        )
    );
};

module.exports = notFound;