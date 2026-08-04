/*Beklenmeyen hataları yakalar.
Kullanıcıya teknik hata göstermez.
Sadece geliştirici terminalde görür. */
const errorHandler = (err,req,res,next)=>{
    //Hatanın detayını terminale yazdırır
    console.error(err.stack);
    //Kullanıcıya güvenli bir hata mesajı döndürür
    res.status(500).json({
        success :false,
        message :"Sunucuda Beklenmeyen Bir Hata Oluştu"
    });

};
//Fonksiyonları dışa aktarır
module.exports =errorHandler;