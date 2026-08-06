const axios = require ("axios");

const api =axios.create({
    baseURL: process.env.TMDB_BASE_URL,
    headers: {
        Authorization :`Bearer ${process.env.TMDB_API_KEY}`,
        Accept:"application/json",
    },
});

//Haftalık Trend Filmler
const getTrendingMovies =async()=>{
    const response =await api.get("/trending/movie/week");

    return response.data.result;
};

//Popüler Filmleri Getirir
const getPopularMovies=async()=>{
    const response =await api.get("/movie/popular");
    return response.data.result;
};

//En Yüksek Puanlı Filmleri Getirir
const getTopRatedMovies =async ()=>{
    const response = await api.get("/movie/top_rated");

    return response.data.result;
};


module.exports={
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
};