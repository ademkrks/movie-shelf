//Uygulama Genelinde Kullanılacak Hata Sınıfı
class AppError extends Error{
    constructor(message ,statusCode){
        super(message);

        //HTTP Durum Kodu
        this.statusCode = statusCode;

        //Hatanın Tipi
        this.status = `${statusCode}`.startsWith("4")
        ? "Fail"
        : "Error";

        //Operasyonel Hata Oldupunu Belirtir
        this.isOperationel = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

//Dışa Aktarır
module.exports=AppError;