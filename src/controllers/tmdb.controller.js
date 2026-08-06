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

module.exports={
    getTrendingMovies,
};