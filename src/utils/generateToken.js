const jwt = require("jsonwebtoken");
const env = require("../config/env");


// JWT oluşturur
const generateToken = (
    userId,
    tokenVersion = 0
) => {
    return jwt.sign(
        {
            id: userId,
            tokenVersion,
        },
        env.jwtSecret,
        {
            expiresIn: env.jwtExpiresIn,
        }
    );
};


module.exports = generateToken;