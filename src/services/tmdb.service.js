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

//Yakında Vizyona Girecekler
const getUpcomingMovies =async()=>{
    const response = await api.get("/movie/upcoming");

    return response.data.result;
};

//Film Arar
const searchMovies = async(query)=>{
    const response =await api.get("/search/movie",{
        params:{
            query,
        },
    });
    return response.data.result;
};

//Film Detayını Getir
const getMovieDetails = async (movieId)=>{
    const response = await api.get(`/movie/${movieId}`);

    return response.data;
};

//Film Oyuncu Kadrosunu Getirir
const getMovieCast = async (movieId)=>{
    const response = await api.get(`/movie/${movieId}/credits`);

    return response.data.cast;
};

module.exports={
    getTrendingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies,
    getMovieDetails,
    getMovieCast,
};