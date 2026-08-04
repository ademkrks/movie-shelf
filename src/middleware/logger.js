//Sunucuya gelen istekleri terminale yazdırır
const logger =(req, res, next)=>{
    console.log(`${req.method} ${req.url}`);
    //Sonraki middleware'e geçer
    next();
};
//Fonksiyonları dışa aktarır
module.exports =logger;