import {
    apiRequest,
} from "./client";


const addRating = async (
    tmdbMovieId,
    rating
) => {
    return apiRequest(
        "/ratings",
        {
            method: "POST",

            body: JSON.stringify({
                tmdbMovieId:
                    Number(
                        tmdbMovieId
                    ),
                rating:
                    Number(
                        rating
                    ),
            }),
        }
    );
};


const getMovieRatings = async (
    tmdbMovieId,
    page = 1,
    limit = 20
) => {
    const params =
        new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });


    return apiRequest(
        `/ratings/movie/${tmdbMovieId}?${params.toString()}`
    );
};


// Kullanıcının belirli filme verdiği puanı getirir
const getMyRating = async (
    tmdbMovieId
) => {
    return apiRequest(
        `/ratings/movie/${tmdbMovieId}/me`
    );
};


const updateRating = async (
    ratingId,
    rating
) => {
    return apiRequest(
        `/ratings/${ratingId}`,
        {
            method: "PUT",

            body: JSON.stringify({
                rating:
                    Number(
                        rating
                    ),
            }),
        }
    );
};


const deleteRating = async (
    ratingId
) => {
    return apiRequest(
        `/ratings/${ratingId}`,
        {
            method: "DELETE",
        }
    );
};


export {
    addRating,
    getMovieRatings,
    getMyRating,
    updateRating,
    deleteRating,
};