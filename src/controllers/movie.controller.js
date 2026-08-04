const movieService =require("../services/movie.service");


const getMovies=(req,res)=>{
    const result = movieService.getMovies();
    res.json(result);
};
const getMovieById=(req,res)=>{
    const movie =movieService.getMovieById(req.params.id);
    if(!movie){
        return res.status(404).json({
            message :"Film Bulunamadı"
        });
    }
    res.json(movie);
}
const createMovie=(req,res)=>{
    const movie = movieService.createMovie(req.body);
    res.status(201).json(movie);
}
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
module.exports ={
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};