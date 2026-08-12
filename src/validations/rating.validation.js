// Rating oluşturma validation'ı
const ratingBodyValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { tmdbMovieId, rating } = body;

    // TMDB film ID kontrolü
    if (tmdbMovieId === undefined || tmdbMovieId === null) {
        return "tmdbMovieId alanı zorunludur.";
    }

    if (!/^\d+$/.test(String(tmdbMovieId))) {
        return "tmdbMovieId geçerli bir sayı olmalıdır.";
    }

    if (Number(tmdbMovieId) <= 0) {
        return "tmdbMovieId 0'dan büyük olmalıdır.";
    }

    // Puan kontrolü
    if (rating === undefined || rating === null) {
        return "rating alanı zorunludur.";
    }

    if (!Number.isInteger(Number(rating))) {
        return "rating tam sayı olmalıdır.";
    }

    if (Number(rating) < 1 || Number(rating) > 10) {
        return "rating 1 ile 10 arasında olmalıdır.";
    }

    return true;
};


// Rating güncelleme validation'ı
const ratingUpdateValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { rating } = body;

    if (rating === undefined || rating === null) {
        return "rating alanı zorunludur.";
    }

    if (!Number.isInteger(Number(rating))) {
        return "rating tam sayı olmalıdır.";
    }

    if (Number(rating) < 1 || Number(rating) > 10) {
        return "rating 1 ile 10 arasında olmalıdır.";
    }

    return true;
};


// Rating ID validation'ı
const ratingIdValidation = (params) => {
    if (!params || !params.id) {
        return "Puan ID zorunludur.";
    }

    if (!/^\d+$/.test(String(params.id))) {
        return "Puan ID geçerli bir sayı olmalıdır.";
    }

    if (Number(params.id) <= 0) {
        return "Puan ID 0'dan büyük olmalıdır.";
    }

    return true;
};


// TMDB film ID validation'ı
const ratingMovieIdValidation = (params) => {
    if (!params || !params.tmdbMovieId) {
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
    ratingBodyValidation,
    ratingIdValidation,
    ratingMovieIdValidation,
    ratingUpdateValidation,
};