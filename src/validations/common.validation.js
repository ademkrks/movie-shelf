// TMDB film ID validation'ı
const tmdbMovieIdValidation = (params) => {
    if (
        !params ||
        params.tmdbMovieId === undefined ||
        params.tmdbMovieId === null
    ) {
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


// TMDB film ID'sinin request body içerisindeki validation'ı
const tmdbMovieBodyValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { tmdbMovieId } = body;

    if (
        tmdbMovieId === undefined ||
        tmdbMovieId === null
    ) {
        return "tmdbMovieId alanı zorunludur.";
    }

    if (!/^\d+$/.test(String(tmdbMovieId))) {
        return "tmdbMovieId geçerli bir sayı olmalıdır.";
    }

    if (Number(tmdbMovieId) <= 0) {
        return "tmdbMovieId 0'dan büyük olmalıdır.";
    }

    return true;
};


module.exports = {
    tmdbMovieIdValidation,
    tmdbMovieBodyValidation,
};