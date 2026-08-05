const jwt= require("jsonwebtoken");

//JWT Oluşturur
const generateToken =(userId)=>{
    return jwt.sign(
        {id:userId},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );
};

module.exports = generateToken;