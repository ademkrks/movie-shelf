/*Film ekleme ve güncelleme sırasında
title ve year alanlarının
gönderilip gönderilmediğini kontrol eder.
*/
const validateMovie = (req ,res, next)=> {
    if(!req.body){
        return res.status(400).json({
            message :"Request body bulunamadı"
        });
    }
    const{title ,year} =req.body;
    if(!title || !year){
        return res.status(400).json({
            message :"title ve year alanları zorunludur"
        });
    }
    //veri doğruysa sonraki middleware'e geçer
    next();
};

module.exports = validateMovie;