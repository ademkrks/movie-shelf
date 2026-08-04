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
const updateMovie=(id,data)=>{
    const movie =movies.find(movie=> movie.id === Number(id));
    if(!movie){
        return null;
    }
    movie.title=data.title; 
    movie.year=data.year;
    return movie;
};
const deleteMovie= (id)=>{
    const index = movies.findIndex(
        movie => movie.id === Number(id)
    );
    if(index === -1){
        return null ;
    }
    return movies.splice(index,1)[0];

};



module.exports={
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};