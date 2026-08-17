import {
    apiRequest,
} from "./client";


const addReview = async (
    tmdbMovieId,
    content
) => {
    return apiRequest(
        "/reviews",
        {
            method: "POST",

            body: JSON.stringify({
                tmdbMovieId:
                    Number(
                        tmdbMovieId
                    ),
                content,
            }),
        }
    );
};


const getMovieReviews = async (
    tmdbMovieId,
    page = 1,
    limit = 10
) => {
    const params =
        new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });


    return apiRequest(
        `/reviews/movie/${tmdbMovieId}?${params.toString()}`
    );
};


const updateReview = async (
    reviewId,
    content
) => {
    return apiRequest(
        `/reviews/${reviewId}`,
        {
            method: "PUT",

            body: JSON.stringify({
                content,
            }),
        }
    );
};


const deleteReview = async (
    reviewId
) => {
    return apiRequest(
        `/reviews/${reviewId}`,
        {
            method: "DELETE",
        }
    );
};


export {
    addReview,
    getMovieReviews,
    updateReview,
    deleteReview,
};