const tmdbService =require("../services/tmdb.service");
const response = require("../utils/response");

//Trende Filmleri Getirir
const getTrendingMovies = async(req,res,next)=>{
    try{
        const movies =await tmdbService.getTrendingMovies();

        response.success(
            res,
            movies,
            "Trend Filmler Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//Popüler Filmleri Getirir
const getPopularMovies= async (req,res,next)=>{
    try{
        const movies =await tmdbService.getPopularMovies();

        response.success(
            res,
            movies,
            "Popüler Filmler Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//En YÜksek Puanlı Filmleri Getirir
const getTopRatedMovies =async(req,res,next)=>{
    try{
        const movies =await tmdbService.getTopRatedMovies();

        response.success(
            res,
            movies,
            "En Yüksek Puanlı Filmler Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//Yakında Vizyona Girecek Filmleri Getirir
const getUpcomingMovies = async (req,res,next)=>{
    try{
        const movies =await tmdbService.getUpcomingMovies();

        response.success(
            res,
            movies,
            "Yakında Vizyona Girecek Filmler Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//Film Arar
const searchMovie= async(req,res,next)=>{
    try{
        const movies =await tmdbService.searchMovies(req.query.q);

        response.success(
            res,
            movies,
            "Arama Sonuçları Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//Film Detaylarını Getirir
const getMovieDetails =async (req,res,next)=>{
    try{
        const movie = await tmdbService.getMovieDetails(req.params.id);

        response.success(
            res,
            movie,
            "Film Detayları Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//Film Oyuncu Kadrosunu Getirir
const getMovieCast =async (req,res,next)=>{
    try{
        const cast = await tmdbService.getMovieCast(req.params.id);

        response.success(
            res,
            cast,
            "Film Oyuncu Kadrosu Getirildi."
        );
    }catch(error){
        next(error);
    }
};

//Film fragmanlarını getirir
const getMovieTrailers =async (req,res,next)=>{
    try{
        const trailers = await tmdbService.getMovieTrailers(req.params.id);

        response.success(
            res,
            trailers,
            "Film Fragmanları Getirildi."
        );
    }catch(error){
        next(error);
    }
};



module.exports={
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovie,
    getMovieDetails,
    getMovieCast,
    getMovieTrailers,
};