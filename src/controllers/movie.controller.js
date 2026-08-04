//service katmanını dahil eder
const movieService =require("../services/movie.service");

//Tüm filmleri getirme
const getMovies=(req,res)=>{
    const result = movieService.getMovies();
    res.json(result);
};
//ID'ye göre film getirme
const getMovieById=(req,res)=>{
    const movie =movieService.getMovieById(req.params.id);
    if(!movie){
        return res.status(404).json({
            message :"Film Bulunamadı"
        });
    }
    res.json(movie);
}
//Yeni film oluşturma
const createMovie=(req,res)=>{
    const movie = movieService.createMovie(req.body);
    res.status(201).json(movie);
}
//Film güncelleme
const updateMovie=(req,res)=>{
    const movie = movieService.updateMovie(
        req.params.id,
        req.body
    );
    if(!movie){
        return res.status(404).json({
            message :"Film Bulunamadı"
        });
    }
    res.json(movie);
    
}
//Film silme
const deleteMovie =(req,res)=>{
    const movie =movieService.deleteMovie(
        req.params.id
    );
    if(!movie){
        return res.status(404).json({
            message :"Film Bulunamadı"
        });
    }
    res.json({
        message :"film Silindi"
    });
}
//Fonksiyonları dışa aktarır
module.exports ={
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};