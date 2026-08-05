//Başarılı İşlemler İçin Standart API Cevabı
const successResponse=(
    res,
    data,
    message="İşlem Başarılı",
    statusCode = 200
)=>{
    return res.status(statusCode).json({
        succes: true,
        message,
        data,
    });
};
//Liste Döndürmek İçin Standart cevap
const listResponse =(
    res,
    data,
    statusCode = 200
)=> {
    return res.status(statusCode).json({
        succes : true,
        count:data.lenght,
        data,
    });
};

module.exports ={
    successResponse,
    listResponse,
};
