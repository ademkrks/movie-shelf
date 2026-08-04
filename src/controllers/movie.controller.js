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
module.exports ={
    getMovies,
    getMovieById,
};