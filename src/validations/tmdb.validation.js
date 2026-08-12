// TMDB film ID validation'ı
const tmdbIdValidation = (params) => {
    if (!params || !params.id) {
        return "Film ID zorunludur.";
    }

    if (!/^\d+$/.test(String(params.id))) {
        return "Film ID geçerli bir sayı olmalıdır.";
    }

    if (Number(params.id) <= 0) {
        return "Film ID 0'dan büyük olmalıdır.";
    }

    return true;
};


// Film arama query validation'ı
const movieSearchValidation = (query) => {
    if (!query || typeof query !== "object") {
        return "Arama parametreleri geçersiz.";
    }

    const { q } = query;

    if (!q || typeof q !== "string") {
        return "Arama sorgusu zorunludur.";
    }

    if (q.trim().length === 0) {
        return "Arama sorgusu boş bırakılamaz.";
    }

    if (q.trim().length < 2) {
        return "Arama sorgusu en az 2 karakter olmalıdır.";
    }

    if (q.trim().length > 100) {
        return "Arama sorgusu en fazla 100 karakter olabilir.";
    }

    return true;
};


module.exports = {
    tmdbIdValidation,
    movieSearchValidation,
};