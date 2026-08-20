const BCRYPT_MAX_PASSWORD_BYTES = 72;


// Şifrenin UTF-8 byte uzunluğunu hesaplar
const getPasswordByteLength = (password) => {
    if (typeof password !== "string") {
        return 0;
    }

    return Buffer.byteLength(
        password,
        "utf8"
    );
};


// bcrypt'in güvenli şekilde işleyebileceği
// maksimum parola uzunluğunu kontrol eder
const isPasswordWithinBcryptLimit = (
    password
) => {
    return (
        typeof password === "string" &&
        getPasswordByteLength(password) <=
            BCRYPT_MAX_PASSWORD_BYTES
    );
};


module.exports = {
    BCRYPT_MAX_PASSWORD_BYTES,
    getPasswordByteLength,
    isPasswordWithinBcryptLimit,
};