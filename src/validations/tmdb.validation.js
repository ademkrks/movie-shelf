// TMDB film ID validation'ı
const tmdbIdValidation = (params) => {
    if (
        !params ||
        params.id === undefined ||
        params.id === null
    ) {
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
    if (
        !query ||
        typeof query !== "object" ||
        Array.isArray(query)
    ) {
        return "Arama parametreleri geçersiz.";
    }

    const { q } = query;

    if (q === undefined || q === null) {
        return "Arama sorgusu zorunludur.";
    }

    if (typeof q !== "string") {
        return "Arama sorgusu metin olmalıdır.";
    }

    const trimmedQuery = q.trim();

    if (trimmedQuery.length === 0) {
        return "Arama sorgusu boş bırakılamaz.";
    }

    if (trimmedQuery.length < 2) {
        return "Arama sorgusu en az 2 karakter olmalıdır.";
    }

    if (trimmedQuery.length > 100) {
        return "Arama sorgusu en fazla 100 karakter olabilir.";
    }

    return true;
};


module.exports = {
    tmdbIdValidation,
    movieSearchValidation,
};