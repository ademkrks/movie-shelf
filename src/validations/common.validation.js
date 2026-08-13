// TMDB film ID validation'ı
const tmdbMovieIdValidation = (params) => {
    if (
        !params ||
        params.tmdbMovieId === undefined ||
        params.tmdbMovieId === null
    ) {
        return "TMDB film ID zorunludur.";
    }

    if (
        !/^\d+$/.test(
            String(params.tmdbMovieId)
        )
    ) {
        return "TMDB film ID geçerli bir sayı olmalıdır.";
    }

    if (
        Number(params.tmdbMovieId) <= 0
    ) {
        return "TMDB film ID 0'dan büyük olmalıdır.";
    }

    return true;
};


// TMDB film ID'sinin request body içerisindeki validation'ı
const tmdbMovieBodyValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const { tmdbMovieId } = body;

    if (
        tmdbMovieId === undefined ||
        tmdbMovieId === null
    ) {
        return "tmdbMovieId alanı zorunludur.";
    }

    if (
        !/^\d+$/.test(
            String(tmdbMovieId)
        )
    ) {
        return "tmdbMovieId geçerli bir sayı olmalıdır.";
    }

    if (
        Number(tmdbMovieId) <= 0
    ) {
        return "tmdbMovieId 0'dan büyük olmalıdır.";
    }

    return true;
};


// Pagination query parametrelerini doğrular
const paginationValidation = (query) => {
    if (
        !query ||
        typeof query !== "object" ||
        Array.isArray(query)
    ) {
        return "Query parametreleri geçersiz.";
    }

    const {
        page,
        limit,
    } = query;


    // page gönderilmişse pozitif tam sayı olmalıdır
    if (page !== undefined) {
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

        if (pageNumber <= 0) {
            return "Sayfa numarası 0'dan büyük olmalıdır.";
        }
    }


    // limit gönderilmişse 1-100 arasında tam sayı olmalıdır
    if (limit !== undefined) {
        if (
            !/^\d+$/.test(
                String(limit)
            )
        ) {
            return "Limit geçerli bir tam sayı olmalıdır.";
        }

        const limitNumber =
            Number(limit);

        if (
            !Number.isSafeInteger(
                limitNumber
            )
        ) {
            return "Limit geçerli bir tam sayı olmalıdır.";
        }

        if (limitNumber <= 0) {
            return "Limit 0'dan büyük olmalıdır.";
        }

        if (limitNumber > 100) {
            return "Limit en fazla 100 olabilir.";
        }
    }

    return true;
};


module.exports = {
    tmdbMovieIdValidation,
    tmdbMovieBodyValidation,
    paginationValidation,
};