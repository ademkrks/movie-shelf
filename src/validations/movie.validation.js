// Film oluşturma ve güncelleme validation'ı
const movieValidation = (body) => {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "İstek gövdesi geçersiz.";
    }

    const { title, year } = body;

    // Film adı kontrolü
    if (typeof title !== "string") {
        return "title alanı zorunludur.";
    }

    if (title.trim().length === 0) {
        return "title alanı boş bırakılamaz.";
    }

    if (title.trim().length > 255) {
        return "title alanı en fazla 255 karakter olabilir.";
    }

    // Yıl kontrolü
    if (year === undefined || year === null) {
        return "year alanı zorunludur.";
    }

    if (!Number.isInteger(Number(year))) {
        return "year alanı geçerli bir tam sayı olmalıdır.";
    }

    const currentYear = new Date().getFullYear();

    if (
        Number(year) < 1888 ||
        Number(year) > currentYear + 10
    ) {
        return `year 1888 ile ${currentYear + 10} arasında olmalıdır.`;
    }

    return true;
};


// Film ID validation'ı
const movieIdValidation = (params) => {
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


module.exports = {
    movieValidation,
    movieIdValidation,
};