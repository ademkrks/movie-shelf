const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");

// Timing attack riskini azaltmak için kullanılan sabit hash.
// Gerçek bir kullanıcı parolası değildir.
const DUMMY_PASSWORD_HASH =
    "$2b$10$WUWZz/cGkVo4XjhqqV9Cq.PgqcZnt3KqFloBn3tFjcPINGGTO/NvS";

// Yeni kullanıcı oluşturur
const register = async (data) => {
    const { name, email, password } = data;

    // Temel alan kontrolü
    if (!name || !email || !password) {
        throw new AppError(
            "Ad, e-posta ve şifre alanları zorunludur.",
            400
        );
    }

    // İsim kontrolü
    if (typeof name !== "string" || name.trim().length === 0) {
        throw new AppError(
            "Ad alanı geçerli olmalıdır.",
            400
        );
    }

    // E-posta normalize edilir
    const normalizedEmail = email.trim().toLowerCase();

    // E-posta formatı
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        throw new AppError(
            "Geçerli bir e-posta adresi giriniz.",
            400
        );
    }

    // Minimum parola uzunluğu
    if (password.length < 8) {
        throw new AppError(
            "Şifre en az 8 karakter olmalıdır.",
            400
        );
    }

    // Aynı e-posta kayıtlı mı kontrol eder
    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        throw new AppError(
            "Bu e-posta adresi zaten kayıtlı.",
            400
        );
    }

    // Şifreyi hashler
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluşturur
    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
};


// Kullanıcı girişi
const login = async (data) => {
    const { email, password } = data;

    // Temel alan kontrolü
    if (!email || !password) {
        throw new AppError(
            "E-posta ve şifre zorunludur.",
            400
        );
    }

    // E-posta normalize edilir
    const normalizedEmail = email.trim().toLowerCase();

    // E-posta formatı
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        throw new AppError(
            "Geçerli bir e-posta adresi giriniz.",
            400
        );
    }

    // Kullanıcıyı e-posta ile bulur
    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    // Kullanıcı bulunamadığında da bcrypt çalıştırılır.
    // Böylece kullanıcı var/yok durumları arasındaki
    // işlem süresi farkı azaltılmaya çalışılır.
    if (!user) {
        await bcrypt.compare(
            password,
            DUMMY_PASSWORD_HASH
        );

        throw new AppError(
            "E-posta veya şifre hatalı.",
            401
        );
    }

    // Şifreyi kontrol eder
    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new AppError(
            "E-posta veya şifre hatalı.",
            401
        );
    }

    // JWT oluşturur
    const token = generateToken(user.id);

    // API cevabında password gönderilmez
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };

    return {
        user: safeUser,
        token,
    };
};


module.exports = {
    register,
    login,
};