// Prisma bağlantısını içe aktarır
const prisma = require("../config/prisma");


// Tüm filmleri veritabanından getirir
const getMovies = async () => {
    return await prisma.movie.findMany({
        orderBy: {
            id: "asc",
        },
    });
};


// ID'ye göre film getirir
const getMovieById = async (id) => {
    return await prisma.movie.findUnique({
        where: {
            id: Number(id),
        },
    });
};


// Yeni film oluşturur
const createMovie = async (movie) => {
    return await prisma.movie.create({
        data: {
            title: movie.title,
            year: Number(movie.year),
        },
    });
};


// Filmi günceller
const updateMovie = async (id, data) => {
    return await prisma.movie.update({
        where: {
            id: Number(id),
        },
        data: {
            title: data.title,
            year: Number(data.year),
        },
    });
};


// Filmi siler
const deleteMovie = async (id) => {
    return await prisma.movie.delete({
        where: {
            id: Number(id),
        },
    });
};


// Fonksiyonları dışa aktarır
module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};