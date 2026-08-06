const axios = require ("axios");

const api =axios.create({
    baseURL: process.env.TMDB_BASE_URL,
    headers: {
        Authorization :`Bearer ${process.env.TMDB_API_KEY}`,
        Accept:"application/json",
    },
});

//Haftalık Tren Filmler

const getTrendingMovies =async()=>{
    const response =await api.get("/trending/movie/week");

    return response.data.result;
};

module.exports={
    getTrendingMovies,
};