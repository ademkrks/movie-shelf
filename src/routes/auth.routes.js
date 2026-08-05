const express = require("express");
const router =express.Router();

const authController =require("../controllers/auth.controller");

//Kullanıcı Kayıt İşlemi
router.post("/register",authController.register);

//Kullanıcı Giriş İşlemi
router.post("/login",authController.login);

module.exports= router;