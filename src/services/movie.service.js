const movies =[
    {
        id:1,
        title:"Inception",
        year:2010
    },
    {
        id:2,
        title:"Interstellar",
        year:2014
    },
    {
        id:3,
        title:"The Dark Knight",
        year:2008
    }
];
const getMovies=()=>{
    return movies;
};
const getMovieById=(id)=>{
    return movies.find(movie => movie.id === Number(id));
}
const createMovie=(movie)=>{
    const newMovie ={
        id: movies.length+1,
        ...movie,
    };
    movies.push(newMovie);
    return newMovie;
}


module.exports={
    getMovies,
    getMovieById,
    createMovie,
};