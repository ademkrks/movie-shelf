const getMovies = (req,res)=> {
    res.json({
        success:true,
        message:"Filmler Başarıyla Getirildi"
    });
};
module.exports ={
    getMovies,
};