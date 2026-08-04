const movieService =require("../services/movie.service");
const getMovies=(req,res)=>{
    const result = movieService.getMovies();
    res.json(result);
}
module.exports ={
    getMovies,
};