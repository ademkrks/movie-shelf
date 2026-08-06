const { get } = require("../app");
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


module.exports={
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
};