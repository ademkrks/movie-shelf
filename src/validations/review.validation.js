// Yorum ekleme ve güncelleme validation'ı
const reviewBodyValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { tmdbMovieId, content } = body;

    // TMDB film ID kontrolü
    if (!tmdbMovieId) {
        return "tmdbMovieId alanı zorunludur.";
    }

    if (!/^\d+$/.test(String(tmdbMovieId))) {
        return "tmdbMovieId geçerli bir sayı olmalıdır.";
    }

    if (Number(tmdbMovieId) <= 0) {
        return "tmdbMovieId 0'dan büyük olmalıdır.";
    }

    // Yorum içeriği kontrolü
    if (!content || typeof content !== "string") {
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


// Sadece yorum içeriğinin validation'ı
// PUT işleminde kullanılabilir.
const reviewUpdateValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { content } = body;

    if (!content || typeof content !== "string") {
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
    if (!params || !params.id) {
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
    reviewBodyValidation,
    reviewUpdateValidation,
    reviewIdValidation,
    reviewMovieIdValidation,
};