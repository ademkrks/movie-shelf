// Film oluşturma ve güncelleme validation'ı
const movieValidation = (body) => {
    if (!body || typeof body !== "object") {
        return "İstek gövdesi geçersiz.";
    }

    const { title, year } = body;

    if (!title || typeof title !== "string") {
        return "title alanı zorunludur.";
    }

    if (title.trim().length === 0) {
        return "title alanı boş bırakılamaz.";
    }

    if (!year || !Number.isInteger(Number(year))) {
        return "year alanı geçerli bir sayı olmalıdır.";
    }

    const currentYear = new Date().getFullYear();

    if (Number(year) < 1888 || Number(year) > currentYear + 10) {
        return `year 1888 ile ${currentYear + 10} arasında olmalıdır.`;
    }

    return true;
};

// Film ID validation'ı
const movieIdValidation = (params) => {
    if (!params || !params.id) {
        return "Film ID zorunludur.";
    }

    if (!/^\d+$/.test(String(params.id))) {
        return "Film ID geçerli bir sayı olmalıdır.";
    }

    return true;
};

module.exports = {
    movieValidation,
    movieIdValidation,
};