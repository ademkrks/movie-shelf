// Genel request validation middleware'i

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const errors = [];

            // Body kontrolü
            if (schema.body) {
                const result = schema.body(req.body);

                if (result !== true) {
                    errors.push(result);
                }
            }

            // Parametre kontrolü
            if (schema.params) {
                const result = schema.params(req.params);

                if (result !== true) {
                    errors.push(result);
                }
            }

            // Query kontrolü
            if (schema.query) {
                const result = schema.query(req.query);

                if (result !== true) {
                    errors.push(result);
                }
            }

            // Validation hatası varsa
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    status: "fail",
                    message: "Geçersiz istek.",
                    errors,
                });
            }

            // Validation başarılı
            next();

        } catch (error) {
            next(error);
        }
    };
};


module.exports = validateRequest;