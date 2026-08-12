// Favori işlemleri için TMDB film ID validation'ı
const addFavoriteValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { tmdbMovieId } = body;

    if (tmdbMovieId === undefined || tmdbMovieId === null) {
        return "TMDB film ID zorunludur.";
    }

    if (!/^\d+$/.test(String(tmdbMovieId))) {
        return "TMDB film ID geçerli bir sayı olmalıdır.";
    }

    if (Number(tmdbMovieId) <= 0) {
        return "TMDB film ID 0'dan büyük olmalıdır.";
    }

    return true;
};


const favoriteMovieIdValidation = (params) => {
    if (!params || params.tmdbMovieId === undefined) {
        return "TMDB film ID zorunludur.";
    }

    if (!/^\d+$/.test(String(params.tmdbMovieId))) {
        return "TMDB film ID geçerli bir sayı olmalıdır.";
    }

    if (Number(params.tmdbMovieId) <= 0) {
        return "TMDB film ID 0'dan büyük olmalıdır.";
    }

    return true;
};


module.exports = {
    addFavoriteValidation,
    favoriteMovieIdValidation,
};