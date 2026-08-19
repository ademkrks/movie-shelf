// TMDB film ID validation'ı
const tmdbIdValidation = (params) => {
    if (
        !params ||
        params.id === undefined ||
        params.id === null
    ) {
        return "Film ID zorunludur.";
    }


    if (
        !/^\d+$/.test(
            String(params.id)
        )
    ) {
        return "Film ID geçerli bir sayı olmalıdır.";
    }


    if (
        Number(params.id) <=
        0
    ) {
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


    const {
        q,
        page,
    } = query;


    if (
        q === undefined ||
        q === null
    ) {
        return "Arama sorgusu zorunludur.";
    }


    if (
        typeof q !== "string"
    ) {
        return "Arama sorgusu metin olmalıdır.";
    }


    const trimmedQuery =
        q.trim();


    if (
        trimmedQuery.length ===
        0
    ) {
        return "Arama sorgusu boş bırakılamaz.";
    }


    if (
        trimmedQuery.length <
        2
    ) {
        return "Arama sorgusu en az 2 karakter olmalıdır.";
    }


    if (
        trimmedQuery.length >
        100
    ) {
        return "Arama sorgusu en fazla 100 karakter olabilir.";
    }


    // page gönderilmişse pozitif tam sayı olmalıdır
    if (
        page !== undefined
    ) {
        if (
            !/^\d+$/.test(
                String(page)
            )
        ) {
            return "Sayfa numarası geçerli bir tam sayı olmalıdır.";
        }


        const pageNumber =
            Number(page);


        if (
            !Number.isSafeInteger(
                pageNumber
            )
        ) {
            return "Sayfa numarası geçerli bir tam sayı olmalıdır.";
        }


        if (
            pageNumber <=
            0
        ) {
            return "Sayfa numarası 0'dan büyük olmalıdır.";
        }
    }


    return true;
};


// Batch film ID listesini doğrular
const movieBatchValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }


    const {
        movieIds,
    } = body;


    if (
        !Array.isArray(
            movieIds
        )
    ) {
        return "Film ID listesi zorunludur.";
    }


    if (
        movieIds.length ===
        0
    ) {
        return "En az bir film ID gönderilmelidir.";
    }


    if (
        movieIds.length >
        20
    ) {
        return "Tek istekte en fazla 20 film ID gönderilebilir.";
    }


    const hasInvalidMovieId =
        movieIds.some(
            (movieId) =>
                !Number.isSafeInteger(
                    movieId
                ) ||
                movieId <= 0
        );


    if (
        hasInvalidMovieId
    ) {
        return "Tüm film ID'leri 0'dan büyük tam sayı olmalıdır.";
    }


    return true;
};


module.exports = {
    tmdbIdValidation,
    movieSearchValidation,
    movieBatchValidation,
};