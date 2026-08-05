//Global Hata Yakalama Middleware'i
const errorHandler =(err,req,res,next)=>{
    const statusCode =err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        status: err.status || "error",
        message: err.message || "Sunucu Hatası Oluştu"
    });
};

module.exports =errorHandler;