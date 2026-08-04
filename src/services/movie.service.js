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
//Bütün filmleri döndürür
const getMovies=()=>{
    return movies;
};
//ID'ye göre film döndürür
const getMovieById=(id)=>{
    return movies.find(movie => movie.id === Number(id));
}
//Yeni film oluşturur
const createMovie=(movie)=>{
    const newMovie ={
        id: movies.length+1,
        ...movie,
    };
    movies.push(newMovie);
    return newMovie;
}
//Film güncellemesi yapar
const updateMovie=(id,data)=>{
    const movie =movies.find(movie=> movie.id === Number(id));
    if(!movie){
        return null;
    }
    movie.title=data.title; 
    movie.year=data.year;
    return movie;
};
//Film silme
const deleteMovie= (id)=>{
    const index = movies.findIndex(
        movie => movie.id === Number(id)
    );
    if(index === -1){
        return null ;
    }
    return movies.splice(index,1)[0];

};


//Fonksiyonları dışa aktarır
module.exports={
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};