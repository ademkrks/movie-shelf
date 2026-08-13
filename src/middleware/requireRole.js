const AppError = require("../utils/AppError");


// Endpoint erişimini kullanıcı rolüne göre sınırlar
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Middleware auth'tan sonra çalışmalıdır
        if (!req.user || !req.auth) {
            return next(
                new AppError(
                    "Yetkilendirme başarısız.",
                    401
                )
            );
        }

        const userRole = req.auth.role;

        // Kullanıcının rolü endpoint için uygun değilse
        if (
            !allowedRoles.includes(userRole)
        ) {
            return next(
                new AppError(
                    "Bu işlem için yetkiniz yok.",
                    403
                )
            );
        }

        next();
    };
};


module.exports = requireRole;