// Yorum ekleme validation'ı
const reviewBodyValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const { tmdbMovieId, content } = body;

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

    // Yorum içeriği kontrolü
    if (typeof content !== "string") {
        return "Yorum içeriği zorunludur.";
    }

    if (content.trim().length === 0) {
        return "Yorum içeriği boş bırakılamaz.";
    }

    if (content.trim().length > 1000) {
        return "Yorum içeriği en fazla 1000 karakter olabilir.";
    }

    return true;
};


// Yorum güncelleme validation'ı
const reviewUpdateValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const { content } = body;

    if (typeof content !== "string") {
        return "Yorum içeriği zorunludur.";
    }

    if (content.trim().length === 0) {
        return "Yorum içeriği boş bırakılamaz.";
    }

    if (content.trim().length > 1000) {
        return "Yorum içeriği en fazla 1000 karakter olabilir.";
    }

    return true;
};


// Yorum ID validation'ı
const reviewIdValidation = (params) => {
    if (
        !params ||
        params.id === undefined ||
        params.id === null
    ) {
        return "Yorum ID zorunludur.";
    }

    if (!/^\d+$/.test(String(params.id))) {
        return "Yorum ID geçerli bir sayı olmalıdır.";
    }

    if (Number(params.id) <= 0) {
        return "Yorum ID 0'dan büyük olmalıdır.";
    }

    return true;
};


// TMDB film ID validation'ı
const reviewMovieIdValidation = (params) => {
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


module.exports = {
    reviewBodyValidation,
    reviewUpdateValidation,
    reviewIdValidation,
    reviewMovieIdValidation,
};